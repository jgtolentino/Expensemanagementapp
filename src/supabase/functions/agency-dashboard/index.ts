/**
 * Agency Creative Workroom - Dashboard Metrics Edge Function
 * 
 * Purpose: Get role-based dashboard KPIs and metrics
 * Method: GET
 * Auth: Required (JWT)
 * 
 * Reused from: finance-ppm-dashboard (same structure, different domain)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DashboardMetrics {
  overview: {
    active_campaigns: number;
    active_clients: number;
    total_budget: number;
    team_utilization: number;
    artifacts_this_month: number;
    campaigns_delivered: number;
  };
  recent_activity: {
    recent_artifacts: any[];
    recent_campaigns: any[];
    pending_approvals: any[];
  };
  charts: {
    campaign_status_breakdown: any[];
    utilization_by_role: any[];
    client_activity: any[];
  };
}

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

    // Get user metadata (tenant_id, role)
    const { data: userData, error: userError } = await supabase
      .from('core.users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Fetch dashboard KPIs from analytics view
    const { data: dashboardKpis, error: kpiError } = await supabase
      .from('agency.v_dashboard_kpis')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .single();

    if (kpiError) {
      console.error('Dashboard KPIs error:', kpiError);
    }

    // Fetch recent artifacts
    const { data: recentArtifacts } = await supabase
      .from('agency.artifacts')
      .select(`
        id,
        title,
        artifact_type,
        status,
        created_at,
        campaign:agency.campaigns(campaign_name, client_name)
      `)
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent campaigns
    const { data: recentCampaigns } = await supabase
      .from('agency.campaigns')
      .select(`
        id,
        campaign_code,
        campaign_name,
        client_name,
        status,
        start_date,
        budget_amount
      `)
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch pending approvals (artifacts in review)
    const { data: pendingApprovals } = await supabase
      .from('agency.artifacts')
      .select(`
        id,
        title,
        artifact_type,
        created_at,
        campaign:agency.campaigns(campaign_name, client_name)
      `)
      .eq('tenant_id', userData.tenant_id)
      .eq('status', 'in_review')
      .order('created_at', { ascending: false })
      .limit(20);

    // Campaign status breakdown
    const { data: campaignStatus } = await supabase
      .from('agency.campaigns')
      .select('status')
      .eq('tenant_id', userData.tenant_id);

    const statusBreakdown = campaignStatus?.reduce((acc: any, c: any) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Utilization by role (from view)
    const { data: utilizationData } = await supabase
      .from('agency.v_employee_utilization')
      .select('role, total_hours, billable_hours')
      .eq('tenant_id', userData.tenant_id)
      .gte('week_start_date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);

    const utilizationByRole = utilizationData?.reduce((acc: any, item: any) => {
      if (!acc[item.role]) {
        acc[item.role] = { total_hours: 0, billable_hours: 0 };
      }
      acc[item.role].total_hours += item.total_hours || 0;
      acc[item.role].billable_hours += item.billable_hours || 0;
      return acc;
    }, {}) || {};

    // Client activity (campaign count per client)
    const { data: clientActivity } = await supabase
      .from('agency.v_client_360')
      .select('client_name, active_campaigns, total_budget')
      .eq('tenant_id', userData.tenant_id)
      .order('total_budget', { ascending: false })
      .limit(10);

    // Build response
    const metrics: DashboardMetrics = {
      overview: dashboardKpis || {
        active_campaigns: 0,
        active_clients: 0,
        total_budget: 0,
        team_utilization: 0,
        artifacts_this_month: 0,
        campaigns_delivered: 0,
      },
      recent_activity: {
        recent_artifacts: recentArtifacts || [],
        recent_campaigns: recentCampaigns || [],
        pending_approvals: pendingApprovals || [],
      },
      charts: {
        campaign_status_breakdown: Object.entries(statusBreakdown).map(([status, count]) => ({
          status,
          count,
        })),
        utilization_by_role: Object.entries(utilizationByRole).map(([role, data]: [string, any]) => ({
          role,
          total_hours: data.total_hours,
          billable_hours: data.billable_hours,
          utilization_pct: data.total_hours > 0 ? (data.billable_hours / data.total_hours) * 100 : 0,
        })),
        client_activity: clientActivity || [],
      },
    };

    return new Response(
      JSON.stringify({ success: true, data: metrics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Dashboard error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
