/**
 * Scout Dashboard - Transaction Trends
 * 
 * POST /scout-transaction-trends
 * 
 * Body:
 * {
 *   tab: 'volume' | 'revenue' | 'basket_size' | 'duration',
 *   filters: {
 *     dateRange: { start: string, end: string },
 *     brands?: string[],
 *     categories?: string[],
 *     regions?: string[],
 *     granularity?: 'day' | 'week' | 'month'
 *   }
 * }
 * 
 * Returns:
 * - KPIs
 * - Time series data
 * - Breakdowns by time_of_day, is_weekend
 * - Distribution charts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface TransactionTrendsRequest {
  tab: 'volume' | 'revenue' | 'basket_size' | 'duration';
  filters: {
    dateRange: { start: string; end: string };
    brands?: string[];
    categories?: string[];
    regions?: string[];
    granularity?: 'day' | 'week' | 'month';
  };
}

interface TransactionTrendsResponse {
  kpis: {
    total_baskets?: number;
    total_revenue?: number;
    avg_basket_value?: number;
    avg_items_per_basket?: number;
    avg_duration_seconds?: number;
    impulse_rate?: number;
  };
  time_series: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  breakdowns: {
    by_time_of_day?: Record<string, number>;
    by_day_of_week?: Record<string, number>;
    by_category?: Record<string, number>;
  };
  distribution?: Array<{
    bucket: string;
    count: number;
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

    // Parse request body
    const body: TransactionTrendsRequest = await req.json();
    const { tab, filters } = body;

    // Build query
    let query = supabase
      .from('v_transaction_trends')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('transaction_date', filters.dateRange.start)
      .lte('transaction_date', filters.dateRange.end);

    if (filters.categories && filters.categories.length > 0) {
      query = query.in('product_category', filters.categories);
    }

    if (filters.regions && filters.regions.length > 0) {
      query = query.in('region', filters.regions);
    }

    query = query.order('transaction_date', { ascending: true });

    const { data: trends, error: trendsError } = await query;

    if (trendsError) {
      throw trendsError;
    }

    // Aggregate by granularity
    const aggregated: Record<string, any> = {};

    trends?.forEach((row: any) => {
      const date = new Date(row.transaction_date);
      let key: string;

      if (filters.granularity === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (filters.granularity === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = row.transaction_date;
      }

      if (!aggregated[key]) {
        aggregated[key] = {
          basket_count: 0,
          total_revenue: 0,
          avg_items_per_basket: 0,
          avg_duration_seconds: 0,
          impulse_basket_count: 0,
          total_baskets: 0,
          morning_count: 0,
          afternoon_count: 0,
          evening_count: 0,
          night_count: 0,
          weekday_count: 0,
          weekend_count: 0,
        };
      }

      aggregated[key].basket_count += row.basket_count || 0;
      aggregated[key].total_revenue += row.total_revenue || 0;
      aggregated[key].avg_items_per_basket += (row.avg_items_per_basket || 0) * (row.basket_count || 0);
      aggregated[key].avg_duration_seconds += (row.avg_duration_seconds || 0) * (row.basket_count || 0);
      aggregated[key].impulse_basket_count += row.impulse_basket_count || 0;
      aggregated[key].total_baskets += row.basket_count || 0;
      aggregated[key].morning_count += row.morning_count || 0;
      aggregated[key].afternoon_count += row.afternoon_count || 0;
      aggregated[key].evening_count += row.evening_count || 0;
      aggregated[key].night_count += row.night_count || 0;
      aggregated[key].weekday_count += row.weekday_count || 0;
      aggregated[key].weekend_count += row.weekend_count || 0;
    });

    // Compute averages
    Object.keys(aggregated).forEach(key => {
      const totalBaskets = aggregated[key].total_baskets || 1;
      aggregated[key].avg_items_per_basket = aggregated[key].avg_items_per_basket / totalBaskets;
      aggregated[key].avg_duration_seconds = aggregated[key].avg_duration_seconds / totalBaskets;
    });

    // Build response based on tab
    let timeSeries: Array<{ date: string; value: number }> = [];
    let kpis: any = {};
    let breakdowns: any = {};

    const totalBaskets = Object.values(aggregated).reduce((sum: number, a: any) => sum + a.basket_count, 0);
    const totalRevenue = Object.values(aggregated).reduce((sum: number, a: any) => sum + a.total_revenue, 0);
    const totalImpulse = Object.values(aggregated).reduce((sum: number, a: any) => sum + a.impulse_basket_count, 0);

    switch (tab) {
      case 'volume':
        timeSeries = Object.entries(aggregated).map(([date, data]: [string, any]) => ({
          date,
          value: data.basket_count,
        }));
        kpis = {
          total_baskets: totalBaskets,
          avg_baskets_per_day: totalBaskets / Object.keys(aggregated).length,
        };
        breakdowns = {
          by_time_of_day: {
            morning: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.morning_count, 0),
            afternoon: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.afternoon_count, 0),
            evening: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.evening_count, 0),
            night: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.night_count, 0),
          },
          by_day_of_week: {
            weekday: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.weekday_count, 0),
            weekend: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.weekend_count, 0),
          },
        };
        break;

      case 'revenue':
        timeSeries = Object.entries(aggregated).map(([date, data]: [string, any]) => ({
          date,
          value: data.total_revenue,
        }));
        kpis = {
          total_revenue: totalRevenue,
          avg_basket_value: totalRevenue / totalBaskets,
        };
        break;

      case 'basket_size':
        timeSeries = Object.entries(aggregated).map(([date, data]: [string, any]) => ({
          date,
          value: data.avg_items_per_basket,
        }));
        kpis = {
          avg_items_per_basket: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.avg_items_per_basket, 0) / Object.keys(aggregated).length,
        };
        break;

      case 'duration':
        timeSeries = Object.entries(aggregated).map(([date, data]: [string, any]) => ({
          date,
          value: data.avg_duration_seconds,
        }));
        kpis = {
          avg_duration_seconds: Object.values(aggregated).reduce((sum: number, a: any) => sum + a.avg_duration_seconds, 0) / Object.keys(aggregated).length,
          impulse_rate: (totalImpulse / totalBaskets) * 100,
        };
        break;
    }

    const response: TransactionTrendsResponse = {
      kpis,
      time_series: timeSeries,
      breakdowns,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-transaction-trends:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
