/**
 * Scout Dashboard - Geo Intelligence
 * 
 * POST /scout-geo-intelligence
 * 
 * Body:
 * {
 *   tab: 'regional' | 'stores' | 'demographics' | 'penetration',
 *   filters: {
 *     dateRange: { start: string, end: string },
 *     regions?: string[],
 *     storeTypes?: string[]
 *   }
 * }
 * 
 * Returns:
 * - Regional performance (revenue, stores, growth)
 * - Store locations (lat/lng, type, status)
 * - Demographics by region
 * - Market penetration metrics
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface GeoIntelligenceRequest {
  tab: 'regional' | 'stores' | 'demographics' | 'penetration';
  filters: {
    dateRange: { start: string; end: string };
    regions?: string[];
    storeTypes?: string[];
  };
}

interface GeoIntelligenceResponse {
  kpis: Record<string, any>;
  regional_performance?: Array<{
    region: string;
    island_group: string;
    total_revenue: number;
    basket_count: number;
    active_stores: number;
    revenue_per_store: number;
    growth_pct?: number;
  }>;
  store_locations?: Array<{
    store_id: string;
    store_name: string;
    store_type: string;
    latitude: number;
    longitude: number;
    region: string;
    city: string;
    status: string;
    recent_revenue?: number;
  }>;
  demographics_by_region?: Array<{
    region: string;
    urban_stores: number;
    rural_stores: number;
    urban_revenue: number;
    rural_revenue: number;
  }>;
  penetration_metrics?: Array<{
    region: string;
    active_stores: number;
    coverage_score: number;
    revenue_per_capita?: number;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = userData?.tenant_id;
    if (!tenantId) {
      throw new Error('Tenant not found');
    }

    const body: GeoIntelligenceRequest = await req.json();
    const { tab, filters } = body;

    let response: GeoIntelligenceResponse = { kpis: {} };

    switch (tab) {
      case 'regional': {
        // Query v_geo_intelligence
        let query = supabase
          .from('v_geo_intelligence')
          .select('*')
          .eq('tenant_id', tenantId);

        if (filters.regions && filters.regions.length > 0) {
          query = query.in('region', filters.regions);
        }

        const { data: geoData } = await query;

        response.regional_performance = geoData?.map((row: any) => ({
          region: row.region,
          island_group: row.island_group,
          total_revenue: row.total_revenue,
          basket_count: row.basket_count,
          active_stores: row.active_stores,
          revenue_per_store: row.revenue_per_store,
        })).sort((a, b) => b.total_revenue - a.total_revenue) || [];

        const totalRevenue = response.regional_performance.reduce((sum, r) => sum + r.total_revenue, 0);
        const totalStores = response.regional_performance.reduce((sum, r) => sum + r.active_stores, 0);

        response.kpis = {
          total_regions: response.regional_performance.length,
          total_revenue: totalRevenue,
          total_stores: totalStores,
          avg_revenue_per_store: totalRevenue / totalStores,
          top_region: response.regional_performance[0]?.region,
        };
        break;
      }

      case 'stores': {
        // Query stores with recent revenue
        let storeQuery = supabase
          .from('stores')
          .select('id, store_name, store_type, latitude, longitude, region, city, status')
          .eq('tenant_id', tenantId)
          .eq('status', 'active');

        if (filters.regions && filters.regions.length > 0) {
          storeQuery = storeQuery.in('region', filters.regions);
        }

        if (filters.storeTypes && filters.storeTypes.length > 0) {
          storeQuery = storeQuery.in('store_type', filters.storeTypes);
        }

        const { data: stores } = await storeQuery;

        // Get recent revenue per store
        const storeIds = stores?.map(s => s.id) || [];
        
        let revenueQuery = supabase
          .from('transactions')
          .select('store_id, line_amount')
          .eq('tenant_id', tenantId)
          .in('store_id', storeIds)
          .gte('timestamp', filters.dateRange.start)
          .lte('timestamp', filters.dateRange.end);

        const { data: transactions } = await revenueQuery;

        const storeRevenue: Record<string, number> = {};
        transactions?.forEach(t => {
          storeRevenue[t.store_id] = (storeRevenue[t.store_id] || 0) + parseFloat(t.line_amount);
        });

        response.store_locations = stores?.map(store => ({
          store_id: store.id,
          store_name: store.store_name,
          store_type: store.store_type,
          latitude: parseFloat(store.latitude),
          longitude: parseFloat(store.longitude),
          region: store.region,
          city: store.city,
          status: store.status,
          recent_revenue: storeRevenue[store.id] || 0,
        })) || [];

        response.kpis = {
          total_stores: response.store_locations.length,
          avg_revenue_per_store: Object.values(storeRevenue).reduce((sum, r) => sum + r, 0) / response.store_locations.length,
        };
        break;
      }

      case 'demographics': {
        // Query v_geo_intelligence for urban/rural breakdown
        let query = supabase
          .from('v_geo_intelligence')
          .select('*')
          .eq('tenant_id', tenantId);

        if (filters.regions && filters.regions.length > 0) {
          query = query.in('region', filters.regions);
        }

        const { data: geoData } = await query;

        response.demographics_by_region = geoData?.map((row: any) => ({
          region: row.region,
          urban_stores: row.urban_stores,
          rural_stores: row.rural_stores,
          urban_revenue: row.urban_revenue,
          rural_revenue: row.rural_revenue,
        })) || [];

        const totalUrbanRevenue = response.demographics_by_region.reduce((sum, r) => sum + r.urban_revenue, 0);
        const totalRuralRevenue = response.demographics_by_region.reduce((sum, r) => sum + r.rural_revenue, 0);

        response.kpis = {
          urban_revenue_share: (totalUrbanRevenue / (totalUrbanRevenue + totalRuralRevenue)) * 100,
          rural_revenue_share: (totalRuralRevenue / (totalUrbanRevenue + totalRuralRevenue)) * 100,
        };
        break;
      }

      case 'penetration': {
        // Query stores by region
        let storeQuery = supabase
          .from('stores')
          .select('region, id')
          .eq('tenant_id', tenantId)
          .eq('status', 'active');

        if (filters.regions && filters.regions.length > 0) {
          storeQuery = storeQuery.in('region', filters.regions);
        }

        const { data: stores } = await storeQuery;

        const storesByRegion: Record<string, number> = {};
        stores?.forEach(s => {
          storesByRegion[s.region] = (storesByRegion[s.region] || 0) + 1;
        });

        response.penetration_metrics = Object.entries(storesByRegion).map(([region, count]) => ({
          region,
          active_stores: count,
          coverage_score: Math.min((count / 50) * 100, 100), // Arbitrary: 50 stores = 100% coverage
        }));

        response.kpis = {
          avg_stores_per_region: Object.values(storesByRegion).reduce((sum, c) => sum + c, 0) / Object.keys(storesByRegion).length,
        };
        break;
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-geo-intelligence:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
