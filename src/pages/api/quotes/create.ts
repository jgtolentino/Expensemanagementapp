// pages/api/quotes/create.ts
// Create sales quotation with dual-role approval workflow
// Rate Card Pro

import type { NextApiRequest, NextApiResponse } from 'next';
import { logger, createLogContext, PerformanceTimer } from '@/lib/logger';
import { QuoteCreateSchema } from '@/lib/validation/quotes';
import { requireFeature } from '@/config/featureFlags';

requireFeature('rateCardPro');

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
  const ctx = createLogContext(req, { app: 'ratecard' });
  const timer = new PerformanceTimer(ctx);

  logger.apiRequest('/api/quotes/create', req.method || 'POST', ctx);

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed' },
    });
  }

  try {
    // Validate input
    const parseResult = QuoteCreateSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      logger.warn('Quote validation failed', {
        ...ctx,
        issues: parseResult.error.issues,
      });
      
      return res.status(400).json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid quote data',
          issues: parseResult.error.issues,
        },
      });
    }

    const quoteData = parseResult.data;

    // Business rules
    if (new Date(quoteData.validUntil) < new Date()) {
      return res.status(422).json({
        ok: false,
        error: {
          code: 'INVALID_VALIDITY',
          message: 'Valid until date must be in the future',
        },
      });
    }

    // Calculate line item totals
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const processedLines = quoteData.lines.map(line => {
      const lineSubtotal = line.quantity * line.unitPrice;
      const lineDiscount = line.discount ? (lineSubtotal * line.discount) / 100 : 0;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = line.taxable && line.taxRate 
        ? (lineAfterDiscount * line.taxRate) / 100 
        : 0;
      const lineTotal = lineAfterDiscount + lineTax;

      subtotal += lineSubtotal;
      totalDiscount += lineDiscount;
      totalTax += lineTax;

      return {
        id: crypto.randomUUID(),
        name: line.name,
        description: line.description,
        line_type: line.type,
        pricing_model: line.pricingModel,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        cost_price: line.costPrice,
        margin: line.margin,
        discount: line.discount,
        tax_rate: line.taxRate || 0,
        tax_amount: lineTax,
        taxable: line.taxable,
        subtotal: lineSubtotal,
        total: lineTotal,
        project_id: line.projectId,
        task_id: line.taskId,
        resource_id: line.resourceId,
        supplier_id: line.supplierId,
        sequence: line.order || 0,
        notes: line.notes,
        active: true,
      };
    });

    const totalAmount = subtotal - totalDiscount + totalTax;

    // Generate quote code
    const quoteCode = await generateQuoteCode(ctx.tenantId);

    // Prepare database record
    const quote = {
      id: crypto.randomUUID(),
      code: quoteCode,
      name: quoteData.name,
      partner_id: quoteData.clientId,
      partner_contact_id: quoteData.clientContactId,
      project_id: quoteData.projectId,
      state: quoteData.status || 'draft',
      quote_date: quoteData.quoteDate || new Date().toISOString(),
      validity_date: quoteData.validUntil,
      expected_close_date: quoteData.expectedCloseDate,
      account_manager_id: ctx.userId || quoteData.accountManagerId,
      subtotal,
      total_discount: totalDiscount,
      total_tax: totalTax,
      total_amount: totalAmount,
      currency: quoteData.currency || 'PHP',
      probability: quoteData.probability,
      payment_terms: quoteData.paymentTerms,
      delivery_terms: quoteData.deliveryTerms,
      notes: quoteData.notes,
      terms_and_conditions: quoteData.termsAndConditions,
      version: 1,
      company_id: ctx.tenantId,
      workspace_id: ctx.workspaceId,
      create_uid: ctx.userId,
      create_date: new Date().toISOString(),
      write_uid: ctx.userId,
      write_date: new Date().toISOString(),
      active: true,
      tags: quoteData.tags || [],
    };

    // TODO: Insert into Supabase with transaction
    // const { data, error } = await supabase.rpc('create_quote_with_lines', {
    //   p_quote: quote,
    //   p_lines: processedLines,
    // });

    logger.info('Quote created', {
      ...ctx,
      quoteCode,
      totalAmount,
      lineCount: processedLines.length,
    });

    // Log audit
    logger.audit('sale_order', 'create', quote.id, ctx);

    // If status is 'sent', trigger AM approval workflow
    if (quoteData.status === 'sent' || quoteData.status === 'pending_am') {
      await triggerQuoteApprovalWorkflow(quote.id, 'account_manager', ctx);
    }

    timer.endWithThreshold('Quote creation completed', 2000);

    return res.status(201).json({
      ok: true,
      data: {
        id: quote.id,
        code: quoteCode,
        totalAmount,
        subtotal,
        totalTax,
        status: quote.state,
        validUntil: quote.validity_date,
      },
    });

  } catch (error: any) {
    logger.error('Quote creation failed', {
      ...ctx,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create quote',
      },
    });
  }
}

// Generate unique quote code
async function generateQuoteCode(tenantId?: string): Promise<string> {
  // Format: QT-2024-001
  const year = new Date().getFullYear();
  
  // TODO: Query database for last code number
  const sequence = Math.floor(Math.random() * 1000) + 1;
  const code = `QT-${year}-${String(sequence).padStart(3, '0')}`;
  
  return code;
}

// Trigger dual-role approval workflow (AM → FD)
async function triggerQuoteApprovalWorkflow(
  quoteId: string,
  role: 'account_manager' | 'finance_director',
  ctx: any
): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_QUOTE_SUBMITTED;
  
  if (!webhookUrl) {
    logger.warn('n8n webhook not configured', ctx);
    return;
  }

  try {
    logger.workflowStart('quote_approval', { ...ctx, quoteId, role });

    // TODO: Call n8n webhook for dual-role workflow
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     quoteId,
    //     approvalRole: role,
    //     tenantId: ctx.tenantId,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });

    logger.info('Quote approval workflow triggered', {
      ...ctx,
      quoteId,
      role,
    });
  } catch (error: any) {
    logger.workflowError('quote_approval', error, { ...ctx, quoteId });
  }
}
