/**
 * Agency Creative Workroom - Campaign Metrics Edge Function
 * 
 * Purpose: Get detailed metrics for a specific campaign
 * Method: POST
 * Auth: Required (JWT)
 * 
 * Reused pattern: Similar to finance-ppm-wip-calculate but for campaign analytics
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user metadata
    const { data: userData, error: userError } = await supabase
      .from('core.users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Parse request body
    const body = await req.json();
    const { campaign_id } = body;

    if (!campaign_id) {
      throw new Error('campaign_id is required');
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('agency.campaigns')
      .select(`
        id,
        campaign_code,
        campaign_name,
        campaign_type,
        client_name,
        brand:agency.brands(brand_name),
        status,
        start_date,
        end_date,
        budget_amount,
        currency,
        lead_creative:core.users!lead_creative(name, role),
        account_manager:core.users!account_manager(name, role)
      `)
      .eq('id', campaign_id)
      .eq('tenant_id', userData.tenant_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Get campaign phases
    const { data: phases } = await supabase
      .from('agency.campaign_phases')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('phase_order');

    // Get artifacts for campaign
    const { data: artifacts } = await supabase
      .from('agency.artifacts')
      .select('id, title, artifact_type, status, created_at')
      .eq('campaign_id', campaign_id);

    const artifactsByType = artifacts?.reduce((acc: any, a: any) => {
      acc[a.artifact_type] = (acc[a.artifact_type] || 0) + 1;
      return acc;
    }, {}) || {};

    const artifactsByStatus = artifacts?.reduce((acc: any, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get timesheet data for campaign
    const { data: timesheets } = await supabase
      .from('agency.timesheet_entries')
      .select(`
        id,
        hours,
        billable,
        bill_rate,
        bill_amount,
        cost_rate,
        cost_amount,
        employee:core.users(name, role)
      `)
      .eq('campaign_id', campaign_id);

    const totalHours = timesheets?.reduce((sum, t) => sum + (t.hours || 0), 0) || 0;
    const billableHours = timesheets?.filter(t => t.billable).reduce((sum, t) => sum + (t.hours || 0), 0) || 0;
    const totalCost = timesheets?.reduce((sum, t) => sum + (t.cost_amount || 0), 0) || 0;
    const totalRevenue = timesheets?.filter(t => t.billable).reduce((sum, t) => sum + (t.bill_amount || 0), 0) || 0;

    const timeByRole = timesheets?.reduce((acc: any, t: any) => {
      const role = t.employee?.role || 'unknown';
      if (!acc[role]) {
        acc[role] = { hours: 0, cost: 0, revenue: 0 };
      }
      acc[role].hours += t.hours || 0;
      acc[role].cost += t.cost_amount || 0;
      acc[role].revenue += t.billable ? (t.bill_amount || 0) : 0;
      return acc;
    }, {}) || {};

    // Get team allocation
    const { data: allocations } = await supabase
      .from('agency.team_allocations')
      .select(`
        id,
        employee:core.users(name, role),
        allocated_hours,
        week_start_date
      `)
      .eq('campaign_id', campaign_id)
      .gte('week_start_date', new Date().toISOString().split('T')[0])
      .order('week_start_date');

    // Budget burn rate
    const budgetUsed = totalCost;
    const budgetRemaining = (campaign.budget_amount || 0) - budgetUsed;
    const budgetBurnPct = campaign.budget_amount > 0 ? (budgetUsed / campaign.budget_amount) * 100 : 0;

    // Get integration data
    const integrationData: any = {};

    // Procure quote (if linked)
    if (campaign.procure_quote_id) {
      const { data: quote } = await supabase
        .from('procure.project_quotes')
        .select('quote_number, total_amount, status')
        .eq('id', campaign.procure_quote_id)
        .single();
      integrationData.procure_quote = quote;
    }

    // T&E expenses using integration function
    const { data: expenses } = await supabase
      .rpc('agency.get_campaign_expenses', { campaign_id });
    integrationData.te_expenses = expenses;

    // Gearroom equipment using integration function
    const { data: equipment } = await supabase
      .rpc('agency.get_campaign_equipment', { campaign_id });
    integrationData.gearroom_equipment = equipment;

    // Build response
    const metrics = {
      campaign: {
        ...campaign,
        phases: phases || [],
      },
      budget: {
        total_budget: campaign.budget_amount,
        budget_used: budgetUsed,
        budget_remaining: budgetRemaining,
        burn_rate_pct: budgetBurnPct,
        projected_total: budgetUsed > 0 ? budgetUsed / 0.7 : 0, // Assume 70% complete
      },
      time: {
        total_hours: totalHours,
        billable_hours: billableHours,
        non_billable_hours: totalHours - billableHours,
        billable_pct: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        margin: totalRevenue - totalCost,
        margin_pct: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
        by_role: Object.entries(timeByRole).map(([role, data]: [string, any]) => ({
          role,
          hours: data.hours,
          cost: data.cost,
          revenue: data.revenue,
        })),
      },
      artifacts: {
        total_count: artifacts?.length || 0,
        by_type: artifactsByType,
        by_status: artifactsByStatus,
        recent: artifacts?.slice(0, 10) || [],
      },
      team: {
        current_allocation: allocations || [],
        total_allocated_hours: allocations?.reduce((sum, a) => sum + (a.allocated_hours || 0), 0) || 0,
      },
      integrations: integrationData,
    };

    return new Response(
      JSON.stringify({ success: true, data: metrics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Campaign metrics error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
