/**
 * Finance PPM - Scheduled Jobs Edge Function
 * 
 * Purpose: Run nightly/scheduled maintenance tasks
 * Method: POST
 * Auth: Internal (cron job secret)
 * 
 * Jobs:
 * - Calculate WIP for all active projects
 * - Mark overdue invoices
 * - Send AR aging alerts
 * - Sync Notion workspace (future)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CRON_SECRET = Deno.env.get('CRON_SECRET')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify cron secret
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      throw new Error('Unauthorized - invalid cron secret');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: any = {
      timestamp: new Date().toISOString(),
      jobs: [],
    };

    // =========================================================
    // Job 1: Calculate WIP for all active projects
    // =========================================================
    console.log('Job 1: Calculating WIP...');
    const asOfDate = new Date().toISOString().split('T')[0];

    const { data: activeProjects } = await supabase
      .from('finance_ppm.projects')
      .select('id, tenant_id, project_code, project_name')
      .in('status', ['active', 'planned']);

    let wipCalculated = 0;
    let wipErrors = 0;

    for (const project of activeProjects || []) {
      try {
        // Calculate unbilled time
        const { data: timesheets } = await supabase
          .from('finance_ppm.timesheet_entries')
          .select('bill_amount, entry_date')
          .eq('project_id', project.id)
          .eq('status', 'approved')
          .eq('billable', true)
          .lte('entry_date', asOfDate)
          .is('invoice_line_id', null);

        const timeWIP = timesheets?.reduce((sum, ts) => sum + (ts.bill_amount || 0), 0) || 0;
        const oldestDate = timesheets?.[0]?.entry_date || null;

        // Upsert WIP entry
        await supabase.from('finance_ppm.wip_entries').upsert({
          tenant_id: project.tenant_id,
          project_id: project.id,
          calculation_date: asOfDate,
          time_wip: timeWIP,
          expense_wip: 0,
          fee_wip: 0,
          oldest_entry_date: oldestDate,
          ready_to_invoice: timeWIP > 100000,
        }, {
          onConflict: 'project_id,calculation_date',
        });

        wipCalculated++;
      } catch (error) {
        console.error(`WIP calc error for project ${project.project_code}:`, error);
        wipErrors++;
      }
    }

    results.jobs.push({
      name: 'wip_calculation',
      status: 'completed',
      projects_processed: wipCalculated,
      errors: wipErrors,
    });

    // =========================================================
    // Job 2: Mark overdue invoices
    // =========================================================
    console.log('Job 2: Marking overdue invoices...');

    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('finance_ppm.invoices')
      .update({ status: 'overdue' })
      .in('status', ['sent', 'partial'])
      .lt('due_date', new Date().toISOString().split('T')[0])
      .gt('balance', 0)
      .select('id');

    results.jobs.push({
      name: 'mark_overdue_invoices',
      status: overdueError ? 'failed' : 'completed',
      invoices_marked: overdueInvoices?.length || 0,
      error: overdueError?.message,
    });

    // =========================================================
    // Job 3: Update project financials (monthly rollup)
    // =========================================================
    console.log('Job 3: Updating project financials...');

    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    
    const { data: projectsToUpdate } = await supabase
      .from('finance_ppm.projects')
      .select('id, tenant_id')
      .in('status', ['active', 'planned']);

    let financialsUpdated = 0;

    for (const project of projectsToUpdate || []) {
      try {
        // Calculate actual cost (approved timesheets this month)
        const { data: timesheets } = await supabase
          .from('finance_ppm.timesheet_entries')
          .select('cost_amount')
          .eq('project_id', project.id)
          .eq('status', 'approved')
          .gte('entry_date', currentMonth)
          .lt('entry_date', new Date(new Date(currentMonth).setMonth(new Date(currentMonth).getMonth() + 1)).toISOString().split('T')[0]);

        const actualCost = timesheets?.reduce((sum, ts) => sum + (ts.cost_amount || 0), 0) || 0;

        // Calculate revenue (invoiced this month)
        const { data: invoices } = await supabase
          .from('finance_ppm.invoices')
          .select('total_amount')
          .eq('project_id', project.id)
          .gte('invoice_date', currentMonth)
          .lt('invoice_date', new Date(new Date(currentMonth).setMonth(new Date(currentMonth).getMonth() + 1)).toISOString().split('T')[0]);

        const revenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

        // Upsert project_financials
        await supabase.from('finance_ppm.project_financials').upsert({
          tenant_id: project.tenant_id,
          project_id: project.id,
          period_month: currentMonth,
          actual_cost: actualCost,
          revenue: revenue,
          budget_amount: 0, // Would come from project budget
        }, {
          onConflict: 'project_id,period_month',
        });

        financialsUpdated++;
      } catch (error) {
        console.error(`Financials update error for project ${project.id}:`, error);
      }
    }

    results.jobs.push({
      name: 'update_project_financials',
      status: 'completed',
      projects_updated: financialsUpdated,
    });

    // =========================================================
    // Job 4: Clean up old draft timesheets (optional)
    // =========================================================
    console.log('Job 4: Cleaning up old draft timesheets...');

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3); // 3 months ago

    const { data: deletedTimesheets } = await supabase
      .from('finance_ppm.timesheet_entries')
      .delete()
      .eq('status', 'draft')
      .lt('entry_date', cutoffDate.toISOString().split('T')[0])
      .select('id');

    results.jobs.push({
      name: 'cleanup_old_drafts',
      status: 'completed',
      timesheets_deleted: deletedTimesheets?.length || 0,
    });

    // =========================================================
    // Summary
    // =========================================================
    const successCount = results.jobs.filter((j: any) => j.status === 'completed').length;
    const failCount = results.jobs.filter((j: any) => j.status === 'failed').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...results,
          summary: {
            total_jobs: results.jobs.length,
            successful: successCount,
            failed: failCount,
          },
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Scheduled jobs error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
