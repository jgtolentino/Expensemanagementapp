/**
 * Finance PPM - Dashboard Metrics Edge Function
 * 
 * Purpose: Get role-based dashboard KPIs and metrics
 * Method: GET
 * Auth: Required (JWT)
 * 
 * Query params:
 * - role: User role (from JWT)
 * - period: 'month' | 'quarter' | 'year'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DashboardMetrics {
  firm_overview: {
    active_engagements: number;
    active_projects: number;
    total_wip: number;
    wip_ready_to_invoice: number;
    ar_outstanding: number;
    ar_overdue: number;
    revenue_last_30d: number;
    avg_utilization: number;
  };
  recent_activity: {
    recent_invoices: any[];
    pending_timesheets: any[];
    overdue_invoices: any[];
  };
  charts: {
    revenue_trend: any[];
    utilization_by_role: any[];
    pipeline_by_stage: any[];
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

    // Set RLS session variables
    await supabase.rpc('set_session_variables', {
      tenant_id: userData.tenant_id,
      user_id: user.id,
      role: userData.role,
    });

    // Get query params
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'month';

    // Fetch firm overview from analytics view
    const { data: firmOverview, error: overviewError } = await supabase
      .from('analytics.v_ppm_firm_overview')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .single();

    if (overviewError) {
      console.error('Firm overview error:', overviewError);
    }

    // Fetch recent invoices
    const { data: recentInvoices, error: invoicesError } = await supabase
      .from('finance_ppm.invoices')
      .select(`
        id,
        invoice_number,
        invoice_date,
        client_name,
        total_amount,
        status,
        project:finance_ppm.projects(project_name)
      `)
      .eq('tenant_id', userData.tenant_id)
      .order('invoice_date', { ascending: false })
      .limit(10);

    // Fetch pending timesheets (if PM or finance role)
    let pendingTimesheets = [];
    if (['partner', 'finance_director', 'project_manager'].includes(userData.role)) {
      const { data, error } = await supabase
        .from('finance_ppm.timesheet_entries')
        .select(`
          id,
          entry_date,
          hours,
          status,
          employee:core.users(name),
          project:finance_ppm.projects(project_name)
        `)
        .eq('tenant_id', userData.tenant_id)
        .eq('status', 'submitted')
        .order('entry_date', { ascending: false })
        .limit(20);
      
      if (!error) pendingTimesheets = data || [];
    }

    // Fetch overdue invoices
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('analytics.v_ar_aging')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .in('age_bucket', ['61-90', '90+'])
      .order('days_overdue', { ascending: false })
      .limit(10);

    // Revenue trend (last 12 months)
    const { data: revenueTrend, error: revenueError } = await supabase
      .from('finance_ppm.project_financials')
      .select('period_month, revenue, actual_cost')
      .eq('tenant_id', userData.tenant_id)
      .gte('period_month', new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0])
      .order('period_month', { ascending: true });

    // Utilization by role (this month)
    const { data: utilizationData, error: utilError } = await supabase
      .from('analytics.v_utilization_by_role')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .gte('period_month', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      .order('utilization_pct', { ascending: false });

    // Pipeline by stage (CRM)
    const { data: pipelineData, error: pipelineError } = await supabase
      .from('analytics.v_pipeline_summary')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .order('stage_order');

    // Build response
    const metrics: DashboardMetrics = {
      firm_overview: firmOverview || {
        active_engagements: 0,
        active_projects: 0,
        total_wip: 0,
        wip_ready_to_invoice: 0,
        ar_outstanding: 0,
        ar_overdue: 0,
        revenue_last_30d: 0,
        avg_utilization: 0,
      },
      recent_activity: {
        recent_invoices: recentInvoices || [],
        pending_timesheets: pendingTimesheets,
        overdue_invoices: overdueInvoices || [],
      },
      charts: {
        revenue_trend: revenueTrend || [],
        utilization_by_role: utilizationData || [],
        pipeline_by_stage: pipelineData || [],
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
