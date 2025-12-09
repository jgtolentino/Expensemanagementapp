// lib/api/expenses.ts
// Expense Report API functions using Supabase

import { supabase, getCompanyId, getCurrentUser } from '../supabase';
import type { ExpenseReport, ExpenseLine, CashAdvance } from '../../types';

// ============================================================================
// EXPENSE REPORTS
// ============================================================================

/**
 * Create new expense report with lines
 */
export async function createExpenseReport(data: {
  purpose: string;
  periodStart: string;
  periodEnd: string;
  lines: Array<{
    name: string;
    date: string;
    category: string;
    merchant: string;
    amount: number;
    taxAmount?: number;
    description?: string;
    receiptUrl?: string;
    policyCompliant?: boolean;
  }>;
  cashAdvanceId?: string;
  status?: 'draft' | 'submitted';
}) {
  const user = await getCurrentUser();
  const companyId = await getCompanyId();

  if (!user || !companyId) {
    throw new Error('User not authenticated');
  }

  // Calculate totals
  const subtotal = data.lines.reduce((sum, line) => sum + line.amount, 0);
  const totalTax = data.lines.reduce((sum, line) => sum + (line.taxAmount || 0), 0);
  const totalAmount = subtotal + totalTax;

  // Get cash advance amount if applicable
  let advanceAmount = 0;
  if (data.cashAdvanceId) {
    const { data: advance } = await supabase
      .from('hr_cash_advance')
      .select('amount')
      .eq('id', data.cashAdvanceId)
      .single();
    
    advanceAmount = advance?.amount || 0;
  }

  const netReimbursable = totalAmount - advanceAmount;

  // Count policy violations
  const policyViolations = data.lines.filter(line => !line.policyCompliant).length;

  // Generate expense report code
  const code = await generateExpenseCode(companyId);

  // Insert expense report
  const { data: expenseReport, error: reportError } = await supabase
    .from('hr_expense_sheet')
    .insert({
      code,
      name: data.purpose,
      purpose: data.purpose,
      period_start: data.periodStart,
      period_end: data.periodEnd,
      employee_id: user.id,
      state: data.status || 'draft',
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      net_reimbursable: netReimbursable,
      currency: 'PHP',
      cash_advance_id: data.cashAdvanceId,
      policy_violations: policyViolations,
      company_id: companyId,
    })
    .select()
    .single();

  if (reportError) {
    console.error('Error creating expense report:', reportError);
    throw reportError;
  }

  // Insert expense lines
  const expenseLines = data.lines.map(line => ({
    expense_report_id: expenseReport.id,
    name: line.name,
    date: line.date,
    category: line.category,
    merchant: line.merchant,
    amount: line.amount,
    tax_amount: line.taxAmount || 0,
    description: line.description,
    receipt_url: line.receiptUrl,
    policy_compliant: line.policyCompliant !== false,
    state: 'draft',
    employee_id: user.id,
    currency: 'PHP',
    company_id: companyId,
  }));

  const { error: linesError } = await supabase
    .from('hr_expense')
    .insert(expenseLines);

  if (linesError) {
    console.error('Error creating expense lines:', linesError);
    throw linesError;
  }

  return expenseReport;
}

/**
 * Get expense reports for current user
 */
export async function getExpenseReports(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const user = await getCurrentUser();
  const companyId = await getCompanyId();

  if (!user || !companyId) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('hr_expense_sheet')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', user.id)
    .order('create_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('state', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('period_start', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('period_end', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching expense reports:', error);
    throw error;
  }

  return data;
}

/**
 * Get expense report by ID with lines
 */
export async function getExpenseReport(id: string) {
  const companyId = await getCompanyId();

  if (!companyId) {
    throw new Error('User not authenticated');
  }

  const { data: report, error: reportError } = await supabase
    .from('hr_expense_sheet')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (reportError) {
    console.error('Error fetching expense report:', reportError);
    throw reportError;
  }

  const { data: lines, error: linesError } = await supabase
    .from('hr_expense')
    .select('*')
    .eq('expense_report_id', id)
    .eq('company_id', companyId)
    .order('date', { ascending: true });

  if (linesError) {
    console.error('Error fetching expense lines:', linesError);
    throw linesError;
  }

  return {
    ...report,
    lines,
  };
}

/**
 * Submit expense report for approval
 */
export async function submitExpenseReport(id: string) {
  const user = await getCurrentUser();
  const companyId = await getCompanyId();

  if (!user || !companyId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('hr_expense_sheet')
    .update({
      state: 'submitted',
      submitted_date: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .eq('employee_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error submitting expense report:', error);
    throw error;
  }

  return data;
}

// ============================================================================
// CASH ADVANCES
// ============================================================================

/**
 * Create cash advance request
 */
export async function createCashAdvance(data: {
  purpose: string;
  amount: number;
  requestedDate: string;
  justification?: string;
}) {
  const user = await getCurrentUser();
  const companyId = await getCompanyId();

  if (!user || !companyId) {
    throw new Error('User not authenticated');
  }

  const code = await generateCashAdvanceCode(companyId);

  const { data: advance, error } = await supabase
    .from('hr_cash_advance')
    .insert({
      code,
      name: data.purpose,
      purpose: data.purpose,
      amount: data.amount,
      requested_date: data.requestedDate,
      justification: data.justification,
      state: 'draft',
      employee_id: user.id,
      currency: 'PHP',
      company_id: companyId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cash advance:', error);
    throw error;
  }

  return advance;
}

/**
 * Get cash advances for current user
 */
export async function getCashAdvances(filters?: { status?: string }) {
  const user = await getCurrentUser();
  const companyId = await getCompanyId();

  if (!user || !companyId) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('hr_cash_advance')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', user.id)
    .order('create_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('state', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cash advances:', error);
    throw error;
  }

  return data;
}

// ============================================================================
// HELPERS
// ============================================================================

async function generateExpenseCode(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get last expense code for this year
  const { data } = await supabase
    .from('hr_expense_sheet')
    .select('code')
    .eq('company_id', companyId)
    .like('code', `EXP-${year}-%`)
    .order('code', { ascending: false })
    .limit(1);

  let sequence = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].code;
    const lastSeq = parseInt(lastCode.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `EXP-${year}-${String(sequence).padStart(3, '0')}`;
}

async function generateCashAdvanceCode(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  
  const { data } = await supabase
    .from('hr_cash_advance')
    .select('code')
    .eq('company_id', companyId)
    .like('code', `CA-${year}-%`)
    .order('code', { ascending: false })
    .limit(1);

  let sequence = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].code;
    const lastSeq = parseInt(lastCode.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `CA-${year}-${String(sequence).padStart(3, '0')}`;
}
