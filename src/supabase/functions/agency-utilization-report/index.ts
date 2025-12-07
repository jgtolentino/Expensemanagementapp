/**
 * Agency Creative Workroom - Utilization Report Edge Function
 * 
 * Purpose: Generate team utilization report
 * Method: POST
 * Auth: Required (JWT - managers only)
 * 
 * Reused pattern: Similar to finance-ppm-dashboard but focused on capacity/utilization
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

    // Check permission (managers only)
    const managerRoles = ['creative_director', 'account_manager', 'strategist'];
    if (!managerRoles.includes(userData.role)) {
      throw new Error('Insufficient permissions. Manager roles required.');
    }

    // Parse request body
    const body = await req.json();
    const { start_date, end_date, employee_id } = body;

    const startDateFinal = start_date || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const endDateFinal = end_date || new Date().toISOString().split('T')[0];

    // Get employee utilization from view
    let utilizationQuery = supabase
      .from('agency.v_employee_utilization')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .gte('week_start_date', startDateFinal)
      .lte('week_start_date', endDateFinal);

    if (employee_id) {
      utilizationQuery = utilizationQuery.eq('employee_id', employee_id);
    }

    const { data: utilization, error: utilError } = await utilizationQuery
      .order('week_start_date', { ascending: false });

    if (utilError) {
      console.error('Utilization query error:', utilError);
    }

    // Aggregate by employee
    const byEmployee: any = {};
    utilization?.forEach((row: any) => {
      if (!byEmployee[row.employee_id]) {
        byEmployee[row.employee_id] = {
          employee_id: row.employee_id,
          employee_name: row.employee_name,
          role: row.role,
          total_hours: 0,
          billable_hours: 0,
          non_billable_hours: 0,
          weeks: 0,
        };
      }
      byEmployee[row.employee_id].total_hours += row.total_hours || 0;
      byEmployee[row.employee_id].billable_hours += row.billable_hours || 0;
      byEmployee[row.employee_id].non_billable_hours += row.non_billable_hours || 0;
      byEmployee[row.employee_id].weeks += 1;
    });

    const employeeUtilization = Object.values(byEmployee).map((emp: any) => ({
      ...emp,
      avg_hours_per_week: emp.weeks > 0 ? emp.total_hours / emp.weeks : 0,
      utilization_pct: emp.total_hours > 0 ? (emp.billable_hours / emp.total_hours) * 100 : 0,
    }));

    // Aggregate by role
    const byRole: any = {};
    utilization?.forEach((row: any) => {
      if (!byRole[row.role]) {
        byRole[row.role] = {
          role: row.role,
          total_hours: 0,
          billable_hours: 0,
          employee_count: new Set(),
        };
      }
      byRole[row.role].total_hours += row.total_hours || 0;
      byRole[row.role].billable_hours += row.billable_hours || 0;
      byRole[row.role].employee_count.add(row.employee_id);
    });

    const roleUtilization = Object.values(byRole).map((role: any) => ({
      role: role.role,
      total_hours: role.total_hours,
      billable_hours: role.billable_hours,
      utilization_pct: role.total_hours > 0 ? (role.billable_hours / role.total_hours) * 100 : 0,
      employee_count: role.employee_count.size,
    }));

    // Top campaigns by hours
    const { data: campaignHours } = await supabase
      .from('agency.v_timesheet_summary_by_campaign')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .order('total_hours', { ascending: false })
      .limit(10);

    // Capacity planning - future allocations
    const { data: futureAllocations } = await supabase
      .from('agency.team_allocations')
      .select(`
        id,
        campaign:agency.campaigns(campaign_name, client_name),
        employee:core.users(name, role),
        allocated_hours,
        week_start_date
      `)
      .eq('tenant_id', userData.tenant_id)
      .gte('week_start_date', new Date().toISOString().split('T')[0])
      .order('week_start_date');

    // Group by week
    const allocationsByWeek: any = {};
    futureAllocations?.forEach((alloc: any) => {
      const week = alloc.week_start_date;
      if (!allocationsByWeek[week]) {
        allocationsByWeek[week] = {
          week_start_date: week,
          total_allocated_hours: 0,
          allocations: [],
        };
      }
      allocationsByWeek[week].total_allocated_hours += alloc.allocated_hours || 0;
      allocationsByWeek[week].allocations.push(alloc);
    });

    // Build response
    const report = {
      period: {
        start_date: startDateFinal,
        end_date: endDateFinal,
      },
      summary: {
        total_employees: employeeUtilization.length,
        total_hours: employeeUtilization.reduce((sum, e) => sum + e.total_hours, 0),
        total_billable: employeeUtilization.reduce((sum, e) => sum + e.billable_hours, 0),
        avg_utilization: employeeUtilization.length > 0
          ? employeeUtilization.reduce((sum, e) => sum + e.utilization_pct, 0) / employeeUtilization.length
          : 0,
      },
      by_employee: employeeUtilization.sort((a, b) => b.utilization_pct - a.utilization_pct),
      by_role: roleUtilization.sort((a, b) => b.utilization_pct - a.utilization_pct),
      top_campaigns: campaignHours || [],
      capacity_planning: {
        upcoming_weeks: Object.values(allocationsByWeek).slice(0, 8),
        total_allocated_next_month: futureAllocations?.reduce((sum, a) => sum + (a.allocated_hours || 0), 0) || 0,
      },
    };

    return new Response(
      JSON.stringify({ success: true, data: report }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Utilization report error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
