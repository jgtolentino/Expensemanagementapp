/**
 * Scout Dashboard - Consumer Analytics
 * 
 * POST /scout-consumer-analytics
 * 
 * Body:
 * {
 *   tab: 'behavior' | 'profiling',
 *   filters: {
 *     dateRange: { start: string, end: string },
 *     segments?: string[],
 *     regions?: string[],
 *     categories?: string[]
 *   }
 * }
 * 
 * Returns:
 * - Request type breakdown (branded/unbranded/unsure)
 * - Request mode breakdown (verbal/pointing/indirect)
 * - Suggestion acceptance rates
 * - Demographics (gender, age, income)
 * - Segment behavior
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ConsumerAnalyticsRequest {
  tab: 'behavior' | 'profiling';
  filters: {
    dateRange: { start: string; end: string };
    segments?: string[];
    regions?: string[];
    categories?: string[];
  };
}

interface ConsumerAnalyticsResponse {
  kpis: Record<string, any>;
  request_breakdown?: {
    by_type: Record<string, number>;
    by_mode: Record<string, number>;
  };
  acceptance_data?: {
    suggestion_made_count: number;
    suggestion_accepted_count: number;
    acceptance_rate: number;
    by_category?: Record<string, number>;
  };
  demographics?: {
    by_gender: Record<string, number>;
    by_age_bracket: Record<string, number>;
    by_income_segment: Record<string, number>;
    by_urban_rural: Record<string, number>;
  };
  segment_behavior?: Array<{
    segment: string;
    basket_count: number;
    avg_basket_value: number;
    avg_lifetime_value: number;
    impulse_rate: number;
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

    const body: ConsumerAnalyticsRequest = await req.json();
    const { tab, filters } = body;

    let response: ConsumerAnalyticsResponse = { kpis: {} };

    switch (tab) {
      case 'behavior': {
        // Query v_consumer_behavior
        let query = supabase
          .from('v_consumer_behavior')
          .select('*')
          .eq('tenant_id', tenantId)
          .gte('behavior_date', filters.dateRange.start)
          .lte('behavior_date', filters.dateRange.end);

        if (filters.regions && filters.regions.length > 0) {
          query = query.in('region', filters.regions);
        }

        if (filters.categories && filters.categories.length > 0) {
          query = query.in('product_category', filters.categories);
        }

        const { data: behaviorData } = await query;

        // Aggregate metrics
        const totals = {
          branded: 0,
          unbranded: 0,
          unsure: 0,
          verbal: 0,
          pointing: 0,
          indirect: 0,
          suggestion_made: 0,
          suggestion_accepted: 0,
          impulse_baskets: 0,
          planned_baskets: 0,
        };

        behaviorData?.forEach((row: any) => {
          totals.branded += row.branded_request_count || 0;
          totals.unbranded += row.unbranded_request_count || 0;
          totals.unsure += row.unsure_request_count || 0;
          totals.verbal += row.verbal_request_count || 0;
          totals.pointing += row.pointing_request_count || 0;
          totals.indirect += row.indirect_request_count || 0;
          totals.suggestion_made += row.suggestion_made_count || 0;
          totals.suggestion_accepted += row.suggestion_accepted_count || 0;
          totals.impulse_baskets += row.impulse_basket_count || 0;
          totals.planned_baskets += row.planned_basket_count || 0;
        });

        response.request_breakdown = {
          by_type: {
            branded: totals.branded,
            unbranded: totals.unbranded,
            unsure: totals.unsure,
          },
          by_mode: {
            verbal: totals.verbal,
            pointing: totals.pointing,
            indirect: totals.indirect,
          },
        };

        response.acceptance_data = {
          suggestion_made_count: totals.suggestion_made,
          suggestion_accepted_count: totals.suggestion_accepted,
          acceptance_rate: (totals.suggestion_accepted / totals.suggestion_made) * 100 || 0,
        };

        response.kpis = {
          branded_pct: (totals.branded / (totals.branded + totals.unbranded + totals.unsure)) * 100,
          verbal_pct: (totals.verbal / (totals.verbal + totals.pointing + totals.indirect)) * 100,
          suggestion_acceptance_rate: response.acceptance_data.acceptance_rate,
          impulse_rate: (totals.impulse_baskets / (totals.impulse_baskets + totals.planned_baskets)) * 100,
        };
        break;
      }

      case 'profiling': {
        // Query v_consumer_profiling
        let query = supabase
          .from('v_consumer_profiling')
          .select('*')
          .eq('tenant_id', tenantId)
          .gte('profile_date', filters.dateRange.start)
          .lte('profile_date', filters.dateRange.end);

        if (filters.regions && filters.regions.length > 0) {
          query = query.in('region', filters.regions);
        }

        if (filters.categories && filters.categories.length > 0) {
          query = query.in('product_category', filters.categories);
        }

        const { data: profilingData } = await query;

        // Aggregate demographics
        const demographics = {
          by_gender: {} as Record<string, number>,
          by_age_bracket: {} as Record<string, number>,
          by_income_segment: {} as Record<string, number>,
          by_urban_rural: {} as Record<string, number>,
        };

        profilingData?.forEach((row: any) => {
          demographics.by_gender[row.gender] = (demographics.by_gender[row.gender] || 0) + row.unique_customers;
          demographics.by_age_bracket[row.age_bracket] = (demographics.by_age_bracket[row.age_bracket] || 0) + row.unique_customers;
          demographics.by_income_segment[row.income_segment] = (demographics.by_income_segment[row.income_segment] || 0) + row.unique_customers;
          demographics.by_urban_rural[row.urban_rural] = (demographics.by_urban_rural[row.urban_rural] || 0) + row.unique_customers;
        });

        response.demographics = demographics;

        // Segment behavior
        const segmentMetrics: Record<string, any> = {};

        profilingData?.forEach((row: any) => {
          const segment = row.income_segment;
          if (!segmentMetrics[segment]) {
            segmentMetrics[segment] = {
              basket_count: 0,
              total_revenue: 0,
              total_ltv: 0,
              impulse_rate_sum: 0,
              count: 0,
            };
          }
          segmentMetrics[segment].basket_count += row.basket_count || 0;
          segmentMetrics[segment].total_revenue += row.total_revenue || 0;
          segmentMetrics[segment].total_ltv += (row.avg_lifetime_value || 0) * (row.unique_customers || 0);
          segmentMetrics[segment].impulse_rate_sum += (row.impulse_rate || 0);
          segmentMetrics[segment].count += 1;
        });

        response.segment_behavior = Object.entries(segmentMetrics).map(([segment, metrics]: [string, any]) => ({
          segment,
          basket_count: metrics.basket_count,
          avg_basket_value: metrics.total_revenue / metrics.basket_count,
          avg_lifetime_value: metrics.total_ltv / metrics.basket_count,
          impulse_rate: metrics.impulse_rate_sum / metrics.count,
        }));

        const totalCustomers = Object.values(demographics.by_gender).reduce((sum: number, count: number) => sum + count, 0);

        response.kpis = {
          total_customers: totalCustomers,
          female_pct: ((demographics.by_gender['female'] || 0) / totalCustomers) * 100,
          urban_pct: ((demographics.by_urban_rural['urban'] || 0) / totalCustomers) * 100,
          middle_income_pct: ((demographics.by_income_segment['middle'] || 0) / totalCustomers) * 100,
        };
        break;
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-consumer-analytics:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
