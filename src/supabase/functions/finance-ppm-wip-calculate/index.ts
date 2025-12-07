/**
 * Finance PPM - WIP Calculation Edge Function
 * 
 * Purpose: Calculate Work-in-Progress for projects
 * Method: POST
 * Auth: Required (JWT - finance roles only)
 * 
 * Body:
 * - project_id: uuid (optional - if not provided, calculates for all active projects)
 * - as_of_date: date (optional - defaults to today)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WIPCalculation {
  project_id: string;
  project_code: string;
  project_name: string;
  time_wip: number;
  expense_wip: number;
  fee_wip: number;
  total_wip: number;
  oldest_entry_date: string | null;
  age_days: number;
  ready_to_invoice: boolean;
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

    // Get user metadata
    const { data: userData, error: userError } = await supabase
      .from('core.users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Check permission (finance roles only)
    if (!['partner', 'finance_director', 'staff_accountant'].includes(userData.role)) {
      throw new Error('Insufficient permissions. Finance roles required.');
    }

    // Parse request body
    const body = await req.json();
    const projectId = body.project_id || null;
    const asOfDate = body.as_of_date || new Date().toISOString().split('T')[0];

    // Get projects to calculate WIP for
    let projects;
    if (projectId) {
      // Single project
      const { data, error } = await supabase
        .from('finance_ppm.projects')
        .select('id, project_code, project_name')
        .eq('id', projectId)
        .eq('tenant_id', userData.tenant_id)
        .single();
      
      if (error) throw new Error('Project not found');
      projects = [data];
    } else {
      // All active projects for tenant
      const { data, error } = await supabase
        .from('finance_ppm.projects')
        .select('id, project_code, project_name')
        .eq('tenant_id', userData.tenant_id)
        .in('status', ['active', 'planned']);
      
      if (error) throw error;
      projects = data || [];
    }

    const wipResults: WIPCalculation[] = [];

    // Calculate WIP for each project
    for (const project of projects) {
      // Calculate unbilled time (timesheets not yet invoiced)
      const { data: timesheetWIP, error: tsError } = await supabase
        .from('finance_ppm.timesheet_entries')
        .select('bill_amount, entry_date')
        .eq('project_id', project.id)
        .eq('status', 'approved')
        .eq('billable', true)
        .lte('entry_date', asOfDate)
        .is('invoice_line_id', null); // Not yet invoiced (assuming we add this FK)

      if (tsError) {
        console.error('Timesheet WIP error:', tsError);
      }

      const timeWIP = timesheetWIP?.reduce((sum, ts) => sum + (ts.bill_amount || 0), 0) || 0;
      const oldestTimesheetDate = timesheetWIP?.[0]?.entry_date || null;

      // Calculate unbilled expenses (T&E expenses not yet invoiced)
      // This would query te.expense_lines if integrated
      const expenseWIP = 0; // Placeholder

      // Calculate unbilled fees
      const feeWIP = 0; // Placeholder

      const totalWIP = timeWIP + expenseWIP + feeWIP;
      const ageDays = oldestTimesheetDate 
        ? Math.floor((new Date(asOfDate).getTime() - new Date(oldestTimesheetDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Determine if ready to invoice (e.g., WIP > threshold or age > 30 days)
      const readyToInvoice = totalWIP > 100000 || ageDays > 30;

      // Upsert WIP entry
      const { error: upsertError } = await supabase
        .from('finance_ppm.wip_entries')
        .upsert({
          tenant_id: userData.tenant_id,
          project_id: project.id,
          calculation_date: asOfDate,
          time_wip: timeWIP,
          expense_wip: expenseWIP,
          fee_wip: feeWIP,
          oldest_entry_date: oldestTimesheetDate,
          ready_to_invoice: readyToInvoice,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'project_id,calculation_date',
        });

      if (upsertError) {
        console.error('WIP upsert error:', upsertError);
      }

      wipResults.push({
        project_id: project.id,
        project_code: project.project_code,
        project_name: project.project_name,
        time_wip: timeWIP,
        expense_wip: expenseWIP,
        fee_wip: feeWIP,
        total_wip: totalWIP,
        oldest_entry_date: oldestTimesheetDate,
        age_days: ageDays,
        ready_to_invoice: readyToInvoice,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          calculation_date: asOfDate,
          projects_processed: wipResults.length,
          total_wip: wipResults.reduce((sum, w) => sum + w.total_wip, 0),
          ready_to_invoice_count: wipResults.filter(w => w.ready_to_invoice).length,
          results: wipResults,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('WIP calculation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
