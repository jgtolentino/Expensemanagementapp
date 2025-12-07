/**
 * Finance PPM - Invoice Generation Edge Function
 * 
 * Purpose: Generate invoice from WIP entries
 * Method: POST
 * Auth: Required (JWT - finance roles only)
 * 
 * Body:
 * - project_id: uuid (required)
 * - invoice_date: date (optional - defaults to today)
 * - due_date: date (optional - defaults to invoice_date + 30 days)
 * - timesheet_entry_ids: uuid[] (optional - if not provided, uses all unbilled approved timesheets)
 * - notes: string (optional)
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

    // Check permission (finance roles only)
    if (!['partner', 'finance_director', 'staff_accountant'].includes(userData.role)) {
      throw new Error('Insufficient permissions. Finance roles required.');
    }

    // Parse request body
    const body = await req.json();
    const { project_id, invoice_date, due_date, timesheet_entry_ids, notes } = body;

    if (!project_id) {
      throw new Error('project_id is required');
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('finance_ppm.projects')
      .select(`
        id,
        project_code,
        project_name,
        engagement:finance_ppm.engagements(
          id,
          engagement_code,
          engagement_name,
          client_name,
          client_id
        )
      `)
      .eq('id', project_id)
      .eq('tenant_id', userData.tenant_id)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    const engagement = project.engagement as any;

    // Set default dates
    const invoiceDateFinal = invoice_date || new Date().toISOString().split('T')[0];
    const dueDateFinal = due_date || new Date(new Date(invoiceDateFinal).setDate(new Date(invoiceDateFinal).getDate() + 30)).toISOString().split('T')[0];

    // Get unbilled timesheets
    let timesheets;
    if (timesheet_entry_ids && timesheet_entry_ids.length > 0) {
      // Use specified timesheets
      const { data, error } = await supabase
        .from('finance_ppm.timesheet_entries')
        .select('*')
        .in('id', timesheet_entry_ids)
        .eq('project_id', project_id)
        .eq('status', 'approved')
        .eq('billable', true);
      
      if (error) throw error;
      timesheets = data || [];
    } else {
      // Use all unbilled approved timesheets
      const { data, error } = await supabase
        .from('finance_ppm.timesheet_entries')
        .select('*')
        .eq('project_id', project_id)
        .eq('status', 'approved')
        .eq('billable', true)
        .is('invoice_line_id', null); // Not yet invoiced
      
      if (error) throw error;
      timesheets = data || [];
    }

    if (timesheets.length === 0) {
      throw new Error('No unbilled timesheets found for this project');
    }

    // Calculate subtotal
    const subtotal = timesheets.reduce((sum, ts) => sum + (ts.bill_amount || 0), 0);
    
    // Calculate tax (VAT 12% for Philippines)
    const taxRate = 12.00;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const { data: invoiceCount } = await supabase
      .from('finance_ppm.invoices')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', userData.tenant_id);
    
    const invoiceNumber = `INV-${String((invoiceCount?.length || 0) + 1).padStart(6, '0')}`;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('finance_ppm.invoices')
      .insert({
        tenant_id: userData.tenant_id,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDateFinal,
        due_date: dueDateFinal,
        project_id: project.id,
        engagement_id: engagement.id,
        client_name: engagement.client_name,
        bill_to_name: engagement.client_name,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: 'PHP',
        paid_amount: 0,
        status: 'draft',
        created_by: user.id,
        notes: notes,
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    // Create invoice lines
    const invoiceLines = timesheets.map((ts, index) => ({
      tenant_id: userData.tenant_id,
      invoice_id: invoice.id,
      line_number: index + 1,
      description: `Professional Services - ${new Date(ts.entry_date).toLocaleDateString()}`,
      quantity: ts.hours,
      unit_of_measure: 'hours',
      unit_price: ts.bill_rate,
      line_total: ts.bill_amount,
      source_type: 'timesheet',
      timesheet_entry_id: ts.id,
    }));

    const { error: linesError } = await supabase
      .from('finance_ppm.invoice_lines')
      .insert(invoiceLines);

    if (linesError) {
      // Rollback invoice
      await supabase.from('finance_ppm.invoices').delete().eq('id', invoice.id);
      throw new Error(`Failed to create invoice lines: ${linesError.message}`);
    }

    // Update timesheet entries to mark as invoiced (if we add invoice_line_id FK)
    // This would prevent double-billing

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          due_date: invoice.due_date,
          client_name: invoice.client_name,
          subtotal: invoice.subtotal,
          tax_amount: invoice.tax_amount,
          total_amount: invoice.total_amount,
          line_count: invoiceLines.length,
          timesheet_count: timesheets.length,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Invoice generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
