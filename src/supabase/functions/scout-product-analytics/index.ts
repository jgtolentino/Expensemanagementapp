/**
 * Scout Dashboard - Product Analytics
 * 
 * POST /scout-product-analytics
 * 
 * Body:
 * {
 *   tab: 'category_mix' | 'pareto' | 'substitutions' | 'basket',
 *   filters: {
 *     dateRange: { start: string, end: string },
 *     brands?: string[],
 *     categories?: string[],
 *     regions?: string[]
 *   }
 * }
 * 
 * Returns:
 * - Category distribution
 * - SKU rankings (Pareto)
 * - Substitution matrix/flows
 * - Basket composition
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ProductAnalyticsRequest {
  tab: 'category_mix' | 'pareto' | 'substitutions' | 'basket';
  filters: {
    dateRange: { start: string; end: string };
    brands?: string[];
    categories?: string[];
    regions?: string[];
  };
}

interface ProductAnalyticsResponse {
  kpis: Record<string, any>;
  category_distribution?: Array<{
    category: string;
    revenue: number;
    share_pct: number;
  }>;
  sku_rankings?: Array<{
    rank: number;
    sku: string;
    product_name: string;
    brand_name: string;
    revenue: number;
    cumulative_pct: number;
  }>;
  substitution_matrix?: Array<{
    original_brand: string;
    substitute_brand: string;
    count: number;
    reason: string;
  }>;
  substitution_flows?: Array<{
    source: string;
    target: string;
    value: number;
  }>;
  basket_composition?: Array<{
    product_name: string;
    basket_penetration: number;
    avg_quantity: number;
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

    const body: ProductAnalyticsRequest = await req.json();
    const { tab, filters } = body;

    let response: ProductAnalyticsResponse = { kpis: {} };

    switch (tab) {
      case 'category_mix': {
        // Query transactions for category distribution
        let query = supabase
          .from('transactions')
          .select('product_category, line_amount')
          .eq('tenant_id', tenantId)
          .gte('timestamp', filters.dateRange.start)
          .lte('timestamp', filters.dateRange.end);

        if (filters.regions && filters.regions.length > 0) {
          query = query.in('region', filters.regions);
        }

        const { data: transactions } = await query;

        const categoryRevenue: Record<string, number> = {};
        transactions?.forEach(t => {
          categoryRevenue[t.product_category] = (categoryRevenue[t.product_category] || 0) + parseFloat(t.line_amount);
        });

        const totalRevenue = Object.values(categoryRevenue).reduce((sum, r) => sum + r, 0) || 1;

        response.category_distribution = Object.entries(categoryRevenue)
          .map(([category, revenue]) => ({
            category,
            revenue,
            share_pct: (revenue / totalRevenue) * 100,
          }))
          .sort((a, b) => b.revenue - a.revenue);

        response.kpis = {
          total_categories: Object.keys(categoryRevenue).length,
          top_category: response.category_distribution[0]?.category,
          top_category_share: response.category_distribution[0]?.share_pct,
        };
        break;
      }

      case 'pareto': {
        // Query v_product_mix for SKU rankings
        const { data: products } = await supabase
          .from('v_product_mix')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('revenue_rank', { ascending: true })
          .limit(100);

        response.sku_rankings = products?.map((p: any) => ({
          rank: p.revenue_rank,
          sku: p.sku,
          product_name: p.product_name,
          brand_name: p.brand_name,
          revenue: p.total_revenue,
          cumulative_pct: p.cumulative_revenue_pct * 100,
        })) || [];

        const top20Count = response.sku_rankings.filter(s => s.rank <= 20).length;
        const top20Revenue = response.sku_rankings
          .filter(s => s.rank <= 20)
          .reduce((sum, s) => sum + s.revenue, 0);

        response.kpis = {
          total_skus: products?.length || 0,
          top_20_count: top20Count,
          top_20_revenue_share: top20Revenue / (response.sku_rankings.reduce((sum, s) => sum + s.revenue, 0) || 1) * 100,
        };
        break;
      }

      case 'substitutions': {
        // Query v_substitution_flows
        let query = supabase
          .from('v_substitution_flows')
          .select('*')
          .eq('tenant_id', tenantId);

        if (filters.categories && filters.categories.length > 0) {
          // Note: Would need to join back to products to filter by category
          // For now, fetch all and filter client-side if needed
        }

        const { data: flows } = await query;

        response.substitution_matrix = flows?.map((f: any) => ({
          original_brand: f.original_brand_name,
          substitute_brand: f.substitute_brand_name,
          count: f.substitution_count,
          reason: f.substitution_reason,
        })) || [];

        response.substitution_flows = flows?.map((f: any) => ({
          source: f.original_brand_name,
          target: f.substitute_brand_name,
          value: f.substitution_count,
        })) || [];

        const totalSubstitutions = flows?.reduce((sum: number, f: any) => sum + f.substitution_count, 0) || 0;
        const outOfStockCount = flows?.filter((f: any) => f.substitution_reason === 'out_of_stock')
          .reduce((sum: number, f: any) => sum + f.substitution_count, 0) || 0;

        response.kpis = {
          total_substitutions: totalSubstitutions,
          out_of_stock_rate: (outOfStockCount / totalSubstitutions) * 100,
          unique_flows: flows?.length || 0,
        };
        break;
      }

      case 'basket': {
        // Query transactions for basket composition
        let query = supabase
          .from('transactions')
          .select('product_name, basket_id, quantity')
          .eq('tenant_id', tenantId)
          .gte('timestamp', filters.dateRange.start)
          .lte('timestamp', filters.dateRange.end);

        if (filters.categories && filters.categories.length > 0) {
          query = query.in('product_category', filters.categories);
        }

        const { data: transactions } = await query;

        const productMetrics: Record<string, { baskets: Set<string>; total_qty: number }> = {};
        const totalBaskets = new Set<string>();

        transactions?.forEach(t => {
          totalBaskets.add(t.basket_id);
          if (!productMetrics[t.product_name]) {
            productMetrics[t.product_name] = { baskets: new Set(), total_qty: 0 };
          }
          productMetrics[t.product_name].baskets.add(t.basket_id);
          productMetrics[t.product_name].total_qty += t.quantity;
        });

        response.basket_composition = Object.entries(productMetrics)
          .map(([product_name, metrics]) => ({
            product_name,
            basket_penetration: (metrics.baskets.size / totalBaskets.size) * 100,
            avg_quantity: metrics.total_qty / metrics.baskets.size,
          }))
          .sort((a, b) => b.basket_penetration - a.basket_penetration)
          .slice(0, 50);

        response.kpis = {
          total_baskets: totalBaskets.size,
          avg_unique_products: Object.keys(productMetrics).length / totalBaskets.size,
          top_penetration: response.basket_composition[0]?.basket_penetration,
        };
        break;
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-product-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
