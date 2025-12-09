// lib/validation/quotes.ts
// Quote/Rate Card validation schemas for Rate Card Pro
// Follows Odoo sale.order / quotation model

import { z } from 'zod';

// Quote status (workflow)
export const QuoteStatusSchema = z.enum([
  'draft',
  'sent',
  'pending_am',
  'pending_fd',
  'approved',
  'rejected',
  'revised',
  'won',
  'lost',
  'cancelled',
]);

// Line item types
export const LineItemTypeSchema = z.enum([
  'service', // creative services, consulting
  'product', // physical goods
  'media', // media placement
  'production', // video/photo production
  'talent', // talent fees
  'markup', // agency markup
  'discount', // discount line
]);

// Pricing model
export const PricingModelSchema = z.enum([
  'fixed', // fixed price
  'hourly', // hourly rate
  'daily', // day rate
  'monthly', // retainer
  'unit', // per unit
  'percentage', // % of media spend
]);

// Approval role
export const ApprovalRoleSchema = z.enum([
  'account_manager', // AM
  'finance_director', // FD
  'managing_director', // MD
  'client', // client approval
]);

// Quote line item
export const QuoteLineCreateSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Line item name is required').max(256),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),

  // Optional fields
  description: z.string().max(2000).optional(),
  type: LineItemTypeSchema.default('service'),
  pricingModel: PricingModelSchema.default('fixed'),

  // Rates
  costPrice: z.number().min(0).optional(), // internal cost
  margin: z.number().min(0).max(100).optional(), // margin %
  discount: z.number().min(0).max(100).optional(), // discount %

  // Tax
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.number().min(0).optional(),
  taxable: z.boolean().default(true),

  // Project allocation
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  phaseId: z.string().uuid().optional(),

  // Resources
  resourceId: z.string().uuid().optional(), // assigned resource
  roleId: z.string().uuid().optional(), // assigned role
  supplierId: z.string().uuid().optional(), // external supplier

  // Hierarchy
  parentLineId: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),

  // Metadata
  rateCardId: z.string().uuid().optional(), // reference to rate card
  notes: z.string().max(1000).optional(),
  customFields: z.record(z.unknown()).optional(),
});

// Quote/Proposal (header)
export const QuoteCreateSchema = z.object({
  // Required fields
  clientId: z.string().uuid('Invalid client ID'),
  name: z.string().min(1, 'Quote name is required').max(256),
  validUntil: z.string().datetime('Invalid validity date'),

  // Optional fields
  clientContactId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),

  // Dates
  quoteDate: z.string().datetime().optional(),
  expectedCloseDate: z.string().datetime().optional(),

  // Status
  status: QuoteStatusSchema.default('draft'),

  // Ownership
  accountManagerId: z.string().uuid().optional(),
  createdById: z.string().uuid().optional(),

  // Lines
  lines: z.array(QuoteLineCreateSchema).min(1, 'At least one line item required'),

  // Terms & Conditions
  paymentTerms: z.string().max(1000).optional(),
  deliveryTerms: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  termsAndConditions: z.string().max(5000).optional(),

  // Pricing summary (auto-calculated)
  subtotal: z.number().min(0).optional(),
  totalDiscount: z.number().min(0).optional(),
  totalTax: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),

  // Currency
  currency: z.string().min(3).max(3).default('PHP'),

  // Probability (sales forecast)
  probability: z.number().min(0).max(100).optional(),

  // Odoo standard fields
  companyId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  active: z.boolean().default(true),

  // Metadata
  version: z.number().int().min(1).default(1),
  parentQuoteId: z.string().uuid().optional(), // for revisions
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

// Update quote
export const QuoteUpdateSchema = QuoteCreateSchema.partial().extend({
  id: z.string().uuid('Invalid quote ID'),
});

// Quote approval workflow
export const QuoteApprovalSchema = z.object({
  id: z.string().uuid('Invalid quote ID'),
  action: z.enum(['approve', 'reject', 'request_revision']),
  role: ApprovalRoleSchema,
  comments: z.string().max(1000).optional(),
  notifyNext: z.boolean().default(true), // notify next approver
});

// Dual-role workflow (AM → FD)
export const QuoteWorkflowTransitionSchema = z.object({
  id: z.string().uuid('Invalid quote ID'),
  fromStatus: QuoteStatusSchema,
  toStatus: QuoteStatusSchema,
  approverId: z.string().uuid().optional(),
  comments: z.string().max(1000).optional(),
  notifyStakeholders: z.boolean().default(true),
});

// Quote conversion to project
export const QuoteConvertSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  projectName: z.string().min(1).max(256),
  projectStartDate: z.string().datetime(),
  projectEndDate: z.string().datetime(),
  projectManagerId: z.string().uuid().optional(),
  createTasks: z.boolean().default(true), // auto-create tasks from line items
  createBudget: z.boolean().default(true), // auto-create budget
  notifyTeam: z.boolean().default(true),
});

// Rate card (standard pricing)
export const RateCardCreateSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Rate card name is required').max(256),
  type: LineItemTypeSchema,
  pricingModel: PricingModelSchema,

  // Rates
  standardRate: z.number().min(0, 'Standard rate cannot be negative'),
  currency: z.string().min(3).max(3).default('PHP'),

  // Optional fields
  description: z.string().max(1000).optional(),
  costRate: z.number().min(0).optional(),
  minimumQuantity: z.number().min(0).optional(),
  maximumQuantity: z.number().min(0).optional(),

  // Validity
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),

  // Client/Industry specific
  clientId: z.string().uuid().optional(), // client-specific rate
  industryId: z.string().uuid().optional(), // industry-specific rate
  isDefault: z.boolean().default(false),

  // Markup rules
  agencyMarkup: z.number().min(0).max(100).optional(), // % markup
  minimumMargin: z.number().min(0).max(100).optional(), // % margin

  // Odoo standard fields
  companyId: z.string().uuid().optional(),
  active: z.boolean().default(true),

  // Metadata
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

// Update rate card
export const RateCardUpdateSchema = RateCardCreateSchema.partial().extend({
  id: z.string().uuid('Invalid rate card ID'),
});

// Quote analytics/reporting
export const QuoteAnalyticsSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  accountManagerId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  status: z.union([QuoteStatusSchema, z.array(QuoteStatusSchema)]).optional(),
  groupBy: z.enum(['month', 'quarter', 'account_manager', 'client', 'status']).optional(),
});

// Query/filter schemas
export const QuoteQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  accountManagerId: z.string().uuid().optional(),
  status: z.union([QuoteStatusSchema, z.array(QuoteStatusSchema)]).optional(),
  quoteDateFrom: z.string().datetime().optional(),
  quoteDateTo: z.string().datetime().optional(),
  validUntilFrom: z.string().datetime().optional(),
  validUntilTo: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  search: z.string().optional(), // full-text search on name/client
  includeLines: z.boolean().default(false), // include line items in response
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  sortBy: z
    .enum(['quoteDate', 'totalAmount', 'status', 'clientName', 'validUntil'])
    .default('quoteDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const RateCardQuerySchema = z.object({
  type: LineItemTypeSchema.optional(),
  pricingModel: PricingModelSchema.optional(),
  clientId: z.string().uuid().optional(),
  industryId: z.string().uuid().optional(),
  validOn: z.string().datetime().optional(), // filter by validity date
  isDefault: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['name', 'standardRate', 'type']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Export types
export type QuoteLineCreate = z.infer<typeof QuoteLineCreateSchema>;
export type QuoteCreate = z.infer<typeof QuoteCreateSchema>;
export type QuoteUpdate = z.infer<typeof QuoteUpdateSchema>;
export type QuoteApproval = z.infer<typeof QuoteApprovalSchema>;
export type QuoteWorkflowTransition = z.infer<typeof QuoteWorkflowTransitionSchema>;
export type QuoteConvert = z.infer<typeof QuoteConvertSchema>;
export type RateCardCreate = z.infer<typeof RateCardCreateSchema>;
export type RateCardUpdate = z.infer<typeof RateCardUpdateSchema>;
export type QuoteQuery = z.infer<typeof QuoteQuerySchema>;
export type RateCardQuery = z.infer<typeof RateCardQuerySchema>;
