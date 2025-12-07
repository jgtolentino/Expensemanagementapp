/**
 * Scout Dashboard - Overview KPIs
 * 
 * GET /scout-dashboard
 * 
 * Returns:
 * - Executive summary KPIs
 * - Recent activity
 * - Top categories, regions, products
 * - Trend indicators (vs prior period)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface DashboardOverview {
  overview: {
    total_baskets: number;
    total_revenue: number;
    unique_customers: number;
    active_stores: number;
    avg_basket_value: number;
    avg_items_per_basket: number;
    avg_duration_seconds: number;
  };
  trends: {
    revenue_growth_pct: number;
    basket_growth_pct: number;
    customer_growth_pct: number;
  };
  top_categories: Array<{
    category: string;
    revenue: number;
    share_pct: number;
  }>;
  top_regions: Array<{
    region: string;
    revenue: number;
    basket_count: number;
  }>;
  top_products: Array<{
    product_name: string;
    brand_name: string;
    revenue: number;
    units_sold: number;
  }>;
  recent_activity: Array<{
    date: string;
    basket_count: number;
    revenue: number;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user's tenant_id
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

    // Date range: Last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const priorEndDate = new Date(startDate);
    const priorStartDate = new Date(startDate);
    priorStartDate.setDate(priorStartDate.getDate() - 30);

    // 1. Overview KPIs (from v_dashboard_overview)
    const { data: overviewData } = await supabase
      .from('v_dashboard_overview')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    // 2. Current period metrics
    const { data: currentMetrics } = await supabase
      .from('transactions')
      .select('basket_id, line_amount')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const currentRevenue = currentMetrics?.reduce((sum, t) => sum + parseFloat(t.line_amount), 0) || 0;
    const currentBaskets = new Set(currentMetrics?.map(t => t.basket_id) || []).size;

    // 3. Prior period metrics
    const { data: priorMetrics } = await supabase
      .from('transactions')
      .select('basket_id, line_amount')
      .eq('tenant_id', tenantId)
      .gte('timestamp', priorStartDate.toISOString())
      .lte('timestamp', priorEndDate.toISOString());

    const priorRevenue = priorMetrics?.reduce((sum, t) => sum + parseFloat(t.line_amount), 0) || 1;
    const priorBaskets = new Set(priorMetrics?.map(t => t.basket_id) || []).size || 1;

    // 4. Top categories
    const { data: topCategories } = await supabase
      .from('transactions')
      .select('product_category, line_amount')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const categoryRevenue: Record<string, number> = {};
    topCategories?.forEach(t => {
      categoryRevenue[t.product_category] = (categoryRevenue[t.product_category] || 0) + parseFloat(t.line_amount);
    });

    const totalRevenue = Object.values(categoryRevenue).reduce((sum, r) => sum + r, 0) || 1;
    const categoryArray = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category,
        revenue,
        share_pct: (revenue / totalRevenue) * 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 5. Top regions
    const { data: topRegions } = await supabase
      .from('transactions')
      .select('region, basket_id, line_amount')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const regionMetrics: Record<string, { baskets: Set<string>; revenue: number }> = {};
    topRegions?.forEach(t => {
      if (!regionMetrics[t.region]) {
        regionMetrics[t.region] = { baskets: new Set(), revenue: 0 };
      }
      regionMetrics[t.region].baskets.add(t.basket_id);
      regionMetrics[t.region].revenue += parseFloat(t.line_amount);
    });

    const regionArray = Object.entries(regionMetrics)
      .map(([region, metrics]) => ({
        region,
        revenue: metrics.revenue,
        basket_count: metrics.baskets.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 6. Top products
    const { data: topProducts } = await supabase
      .from('v_product_mix')
      .select('product_name, brand_name, total_revenue, total_units_sold')
      .eq('tenant_id', tenantId)
      .order('total_revenue', { ascending: false })
      .limit(5);

    // 7. Recent activity (last 7 days)
    const { data: recentActivity } = await supabase
      .from('v_transaction_trends')
      .select('transaction_date, basket_count, total_revenue')
      .eq('tenant_id', tenantId)
      .gte('transaction_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })
      .limit(7);

    // Calculate growth percentages
    const revenueGrowth = ((currentRevenue - priorRevenue) / priorRevenue) * 100;
    const basketGrowth = ((currentBaskets - priorBaskets) / priorBaskets) * 100;

    const response: DashboardOverview = {
      overview: {
        total_baskets: overviewData?.total_baskets || 0,
        total_revenue: overviewData?.total_revenue || 0,
        unique_customers: overviewData?.unique_customers || 0,
        active_stores: overviewData?.active_stores || 0,
        avg_basket_value: overviewData?.avg_basket_value || 0,
        avg_items_per_basket: overviewData?.avg_items_per_basket || 0,
        avg_duration_seconds: overviewData?.avg_duration_seconds || 0,
      },
      trends: {
        revenue_growth_pct: Math.round(revenueGrowth * 100) / 100,
        basket_growth_pct: Math.round(basketGrowth * 100) / 100,
        customer_growth_pct: 0, // TODO: Calculate from customer table
      },
      top_categories: categoryArray,
      top_regions: regionArray,
      top_products: topProducts?.map(p => ({
        product_name: p.product_name,
        brand_name: p.brand_name,
        revenue: p.total_revenue,
        units_sold: p.total_units_sold,
      })) || [],
      recent_activity: recentActivity?.map(a => ({
        date: a.transaction_date,
        basket_count: a.basket_count,
        revenue: a.total_revenue,
      })) || [],
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-dashboard:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
