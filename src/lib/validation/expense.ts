// lib/validation/expense.ts
// Expense validation schemas for T&E (SAP Concur-style)
// Follows Odoo hr.expense model

import { z } from 'zod';

// Expense categories (SAP Concur categories)
export const ExpenseCategorySchema = z.enum([
  'airfare',
  'accommodation',
  'meals',
  'transportation',
  'car_rental',
  'fuel',
  'parking',
  'entertainment',
  'office_supplies',
  'communication',
  'per_diem',
  'mileage',
  'other',
]);

// Expense report status (workflow states)
export const ExpenseReportStatusSchema = z.enum([
  'draft',
  'submitted',
  'pending_approval',
  'approved',
  'rejected',
  'paid',
  'cancelled',
]);

// Cash advance status
export const CashAdvanceStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
  'disbursed',
  'settled',
  'cancelled',
]);

// Currency codes (ISO 4217)
export const CurrencySchema = z.enum(['PHP', 'USD', 'EUR', 'SGD', 'JPY', 'CNY', 'HKD']);

// Payment method
export const PaymentMethodSchema = z.enum([
  'corporate_card',
  'personal_card',
  'cash',
  'bank_transfer',
]);

// Policy compliance
export const PolicyComplianceSchema = z.enum(['compliant', 'warning', 'violation', 'exception']);

// Expense line item (individual expense)
export const ExpenseLineCreateSchema = z.object({
  // Required fields
  date: z.string().datetime('Invalid date format'),
  category: ExpenseCategorySchema,
  merchant: z.string().min(1, 'Merchant is required').max(256),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: CurrencySchema.default('PHP'),

  // Optional fields
  description: z.string().max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  receiptAttached: z.boolean().default(false),
  paymentMethod: PaymentMethodSchema.optional(),

  // Policy compliance
  policyCompliant: z.boolean().default(true),
  policyViolationReason: z.string().optional(),
  complianceStatus: PolicyComplianceSchema.default('compliant'),

  // Mileage-specific (for mileage category)
  mileage: z.number().min(0).optional(),
  mileageRate: z.number().min(0).optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  vehicleType: z.enum(['personal', 'company', 'rental']).optional(),

  // Project allocation
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),

  // Tax
  taxAmount: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  vatRecoverable: z.boolean().default(false),

  // Custom fields
  customFields: z.record(z.unknown()).optional(),
});

// Expense report (header)
export const ExpenseReportCreateSchema = z.object({
  // Required fields
  purpose: z.string().min(1, 'Business purpose is required').max(500),
  periodStart: z.string().datetime('Invalid start date'),
  periodEnd: z.string().datetime('Invalid end date'),

  // Optional fields
  employeeId: z.string().uuid().optional(), // defaults to current user
  employeeName: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(), // approver

  // Lines
  lines: z.array(ExpenseLineCreateSchema).min(1, 'At least one expense line required'),

  // Cash advance settlement
  cashAdvanceId: z.string().uuid().optional(),
  advanceAmount: z.number().min(0).default(0),

  // Status
  status: ExpenseReportStatusSchema.default('draft'),

  // Odoo standard fields
  companyId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  active: z.boolean().default(true),

  // Metadata
  submitDate: z.string().datetime().optional(),
  approvalDate: z.string().datetime().optional(),
  paymentDate: z.string().datetime().optional(),
  comments: z.array(z.string()).optional(),
});

// Update expense report
export const ExpenseReportUpdateSchema = ExpenseReportCreateSchema.partial().extend({
  id: z.string().uuid('Invalid expense report ID'),
});

// Cash advance request
export const CashAdvanceCreateSchema = z.object({
  // Required fields
  requestedAmount: z.number().positive('Requested amount must be greater than 0'),
  currency: CurrencySchema.default('PHP'),
  purpose: z.string().min(1, 'Purpose is required').max(500),
  neededDate: z.string().datetime('Invalid needed date'),

  // Trip details
  tripStart: z.string().datetime('Invalid trip start date'),
  tripEnd: z.string().datetime('Invalid trip end date'),
  destination: z.string().optional(),

  // Optional fields
  employeeId: z.string().uuid().optional(),
  employeeName: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),

  // Breakdown (optional)
  estimatedAirfare: z.number().min(0).optional(),
  estimatedAccommodation: z.number().min(0).optional(),
  estimatedMeals: z.number().min(0).optional(),
  estimatedOther: z.number().min(0).optional(),
  justification: z.string().max(1000).optional(),

  // Status
  status: CashAdvanceStatusSchema.default('draft'),
  approvedAmount: z.number().min(0).optional(),

  // Settlement
  settledAmount: z.number().min(0).default(0),
  outstandingAmount: z.number().min(0).optional(),

  // Odoo standard fields
  companyId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  active: z.boolean().default(true),

  // Dates
  submitDate: z.string().datetime().optional(),
  approvalDate: z.string().datetime().optional(),
  disbursementDate: z.string().datetime().optional(),
  settlementDate: z.string().datetime().optional(),
});

// Update cash advance
export const CashAdvanceUpdateSchema = CashAdvanceCreateSchema.partial().extend({
  id: z.string().uuid('Invalid cash advance ID'),
});

// Mileage entry
export const MileageEntrySchema = z.object({
  date: z.string().datetime('Invalid date'),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  distance: z.number().positive('Distance must be greater than 0'),
  purpose: z.string().min(1, 'Purpose is required').max(500),
  rate: z.number().positive('Rate must be greater than 0'),
  amount: z.number().positive().optional(), // auto-calculated: distance * rate
  vehicleType: z.enum(['personal', 'company', 'rental']).default('personal'),
  projectId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
});

// Expense approval/rejection
export const ExpenseApprovalSchema = z.object({
  id: z.string().uuid('Invalid expense report ID'),
  action: z.enum(['approve', 'reject']),
  approvedAmount: z.number().positive().optional(), // if partial approval
  comments: z.string().max(1000).optional(),
  notifyEmployee: z.boolean().default(true),
});

// Cash advance approval/rejection
export const CashAdvanceApprovalSchema = z.object({
  id: z.string().uuid('Invalid cash advance ID'),
  action: z.enum(['approve', 'reject']),
  approvedAmount: z.number().positive().optional(), // can approve less than requested
  comments: z.string().max(1000).optional(),
  disbursementMethod: z.enum(['bank_transfer', 'cash', 'check']).optional(),
  notifyEmployee: z.boolean().default(true),
});

// OCR receipt processing
export const OcrReceiptSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'), // storage key
  fileUrl: z.string().url('Invalid file URL'),
  fileType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  expenseId: z.string().uuid().optional(), // link to existing expense line
  expenseReportId: z.string().uuid().optional(),
  autoCreateExpense: z.boolean().default(false), // auto-create expense line from OCR
  employeeId: z.string().uuid().optional(),
});

// Per diem calculation
export const PerDiemCalculationSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  destination: z.string().min(1, 'Destination is required'), // city/country
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  mealProvided: z.boolean().default(false), // meals provided by company
  accommodationProvided: z.boolean().default(false),
});

// Query/filter schemas
export const ExpenseReportQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.union([ExpenseReportStatusSchema, z.array(ExpenseReportStatusSchema)]).optional(),
  periodStartFrom: z.string().datetime().optional(),
  periodStartTo: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  hasViolations: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['periodStart', 'totalAmount', 'status', 'submitDate']).default('periodStart'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const CashAdvanceQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.union([CashAdvanceStatusSchema, z.array(CashAdvanceStatusSchema)]).optional(),
  hasOutstanding: z.boolean().optional(),
  tripStartFrom: z.string().datetime().optional(),
  tripStartTo: z.string().datetime().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['tripStart', 'requestedAmount', 'status', 'submitDate']).default('tripStart'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type ExpenseLineCreate = z.infer<typeof ExpenseLineCreateSchema>;
export type ExpenseReportCreate = z.infer<typeof ExpenseReportCreateSchema>;
export type ExpenseReportUpdate = z.infer<typeof ExpenseReportUpdateSchema>;
export type CashAdvanceCreate = z.infer<typeof CashAdvanceCreateSchema>;
export type CashAdvanceUpdate = z.infer<typeof CashAdvanceUpdateSchema>;
export type MileageEntry = z.infer<typeof MileageEntrySchema>;
export type ExpenseApproval = z.infer<typeof ExpenseApprovalSchema>;
export type CashAdvanceApproval = z.infer<typeof CashAdvanceApprovalSchema>;
export type OcrReceipt = z.infer<typeof OcrReceiptSchema>;
export type ExpenseReportQuery = z.infer<typeof ExpenseReportQuerySchema>;
export type CashAdvanceQuery = z.infer<typeof CashAdvanceQuerySchema>;
