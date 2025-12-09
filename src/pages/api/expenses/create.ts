// pages/api/expenses/create.ts
// Create new expense report with validation
// SAP Concur-style expense management

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger, createLogContext, PerformanceTimer } from '@/lib/logger';
import { ExpenseReportCreateSchema } from '@/lib/validation/expense';
import { requireFeature } from '@/config/featureFlags';

// Ensure expense feature is enabled
requireFeature('expense');

interface ApiResponse {
  ok: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    issues?: any[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const ctx = createLogContext(req, { app: 'expense' });
  const timer = new PerformanceTimer(ctx);

  // Log API request
  logger.apiRequest('/api/expenses/create', req.method || 'POST', ctx);

  // Method validation
  if (req.method !== 'POST') {
    logger.warn('Invalid method', { ...ctx, method: req.method });
    return res.status(405).json({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed' },
    });
  }

  try {
    // Validate request body
    const parseResult = ExpenseReportCreateSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      logger.warn('Validation failed', {
        ...ctx,
        issues: parseResult.error.issues,
      });
      
      return res.status(400).json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid expense report data',
          issues: parseResult.error.issues,
        },
      });
    }

    const expenseData = parseResult.data;

    // Business rule validation
    if (new Date(expenseData.periodEnd) < new Date(expenseData.periodStart)) {
      logger.warn('Invalid period range', { ...ctx, expenseData });
      return res.status(422).json({
        ok: false,
        error: {
          code: 'INVALID_PERIOD',
          message: 'Period end date must be after start date',
        },
      });
    }

    // Check for duplicate expense lines
    const merchantCounts = new Map<string, number>();
    for (const line of expenseData.lines) {
      const key = `${line.date}-${line.merchant}-${line.amount}`;
      merchantCounts.set(key, (merchantCounts.get(key) || 0) + 1);
    }
    
    const duplicates = Array.from(merchantCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([key]) => key);

    if (duplicates.length > 0) {
      logger.warn('Duplicate expense lines detected', { ...ctx, duplicates });
      // Continue but flag for review
    }

    // Calculate totals
    const subtotal = expenseData.lines.reduce((sum, line) => sum + line.amount, 0);
    const totalTax = expenseData.lines.reduce((sum, line) => sum + (line.taxAmount || 0), 0);
    const totalDiscount = 0; // If applicable
    const totalAmount = subtotal + totalTax - totalDiscount;
    const netReimbursable = totalAmount - (expenseData.advanceAmount || 0);

    // Count policy violations
    const policyViolations = expenseData.lines.filter(
      line => !line.policyCompliant
    ).length;

    // Generate expense report code
    const reportCode = await generateExpenseReportCode(ctx.tenantId);

    // Prepare database record
    const expenseReport = {
      id: crypto.randomUUID(),
      code: reportCode,
      name: expenseData.purpose,
      purpose: expenseData.purpose,
      period_start: expenseData.periodStart,
      period_end: expenseData.periodEnd,
      employee_id: ctx.userId || expenseData.employeeId,
      employee_name: expenseData.employeeName,
      state: expenseData.status || 'draft',
      total_amount: totalAmount,
      advance_amount: expenseData.advanceAmount || 0,
      net_reimbursable: netReimbursable,
      currency: 'PHP',
      cash_advance_id: expenseData.cashAdvanceId,
      policy_violations: policyViolations,
      company_id: ctx.tenantId,
      workspace_id: ctx.workspaceId,
      create_uid: ctx.userId,
      create_date: new Date().toISOString(),
      write_uid: ctx.userId,
      write_date: new Date().toISOString(),
      active: true,
    };

    // TODO: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('hr_expense_sheet')
    //   .insert(expenseReport)
    //   .select()
    //   .single();

    // For now, simulate successful creation
    logger.info('Expense report created', {
      ...ctx,
      reportCode,
      totalAmount,
      lineCount: expenseData.lines.length,
    });

    // Log audit trail
    logger.audit('hr_expense_sheet', 'create', expenseReport.id, ctx);

    // If submitted (not draft), trigger approval workflow
    if (expenseData.status === 'submitted') {
      await triggerApprovalWorkflow(expenseReport.id, ctx);
    }

    // Track performance
    timer.endWithThreshold('Expense report creation completed', 2000);

    return res.status(201).json({
      ok: true,
      data: {
        id: expenseReport.id,
        code: reportCode,
        totalAmount,
        netReimbursable,
        status: expenseReport.state,
        policyViolations,
      },
    });

  } catch (error: any) {
    logger.error('Expense creation failed', {
      ...ctx,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create expense report',
      },
    });
  }
}

// Helper: Generate unique expense report code
async function generateExpenseReportCode(tenantId?: string): Promise<string> {
  // Format: EXP-2024-001
  const year = new Date().getFullYear();
  
  // TODO: Query database for last code number
  // const { data } = await supabase
  //   .from('hr_expense_sheet')
  //   .select('code')
  //   .like('code', `EXP-${year}-%`)
  //   .order('code', { ascending: false })
  //   .limit(1);
  
  // For now, generate random number
  const sequence = Math.floor(Math.random() * 1000) + 1;
  const code = `EXP-${year}-${String(sequence).padStart(3, '0')}`;
  
  return code;
}

// Helper: Trigger approval workflow (n8n webhook)
async function triggerApprovalWorkflow(expenseId: string, ctx: any): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_EXPENSE_SUBMITTED;
  
  if (!webhookUrl) {
    logger.warn('n8n webhook not configured', ctx);
    return;
  }

  try {
    logger.workflowStart('expense_approval', { ...ctx, expenseId });

    // TODO: Call n8n webhook
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ expenseId, tenantId: ctx.tenantId }),
    // });

    logger.info('Approval workflow triggered', { ...ctx, expenseId });
  } catch (error: any) {
    logger.workflowError('expense_approval', error, { ...ctx, expenseId });
  }
}
