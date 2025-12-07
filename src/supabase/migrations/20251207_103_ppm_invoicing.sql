-- =====================================================================
-- Finance PPM: Invoicing & AR Schema
-- Migration: 20251207_103_ppm_invoicing.sql
-- Description: Create invoicing, payments, WIP, and AR collection tables
-- Dependencies: 20251207_102_ppm_timesheets.sql
-- =====================================================================

-- =====================================================================
-- Table: finance_ppm.invoices
-- Purpose: Client invoices generated from WIP
-- Grain: One row per invoice
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.invoices (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Invoice header
  invoice_number    text UNIQUE NOT NULL,
  invoice_date      date NOT NULL,
  due_date          date NOT NULL,
  
  -- Link to project/engagement
  project_id        uuid NOT NULL REFERENCES finance_ppm.projects(id) ON DELETE CASCADE,
  engagement_id     uuid NOT NULL REFERENCES finance_ppm.engagements(id) ON DELETE CASCADE,
  
  -- Client
  client_name       text NOT NULL,
  client_id         uuid,  -- Future: FK to core.clients
  
  -- Billing address
  bill_to_name      text,
  bill_to_address   text,
  bill_to_tin       text,
  
  -- Amounts
  subtotal          numeric(12,2) NOT NULL,
  tax_rate          numeric(5,2) DEFAULT 12.00,  -- VAT 12% default for PH
  tax_amount        numeric(12,2) NOT NULL,
  total_amount      numeric(12,2) NOT NULL,
  currency          text NOT NULL DEFAULT 'PHP',
  
  -- Payment
  paid_amount       numeric(12,2) DEFAULT 0,
  balance           numeric(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  
  -- Status
  status            text NOT NULL CHECK (status IN ('draft','sent','paid','partial','overdue','cancelled')) DEFAULT 'draft',
  sent_at           timestamptz,
  paid_at           timestamptz,
  
  -- Tracking
  created_by        uuid NOT NULL,  -- FK to core.users
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  notes             text,  -- Notes to client
  internal_notes    text,
  pdf_url           text   -- Link to PDF in Supabase Storage
);

-- Indexes for finance_ppm.invoices
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_tenant ON finance_ppm.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_number ON finance_ppm.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_project ON finance_ppm.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_engagement ON finance_ppm.invoices(engagement_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_status ON finance_ppm.invoices(status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_date ON finance_ppm.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_due_date ON finance_ppm.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoices_created ON finance_ppm.invoices(created_at DESC);

COMMENT ON TABLE finance_ppm.invoices IS 'Client invoices generated from WIP';
COMMENT ON COLUMN finance_ppm.invoices.tax_rate IS 'Tax rate % (default 12% VAT for Philippines)';
COMMENT ON COLUMN finance_ppm.invoices.balance IS 'Auto-calculated: total_amount - paid_amount';
COMMENT ON COLUMN finance_ppm.invoices.status IS 'Invoice status: draft, sent, paid, partial, overdue, cancelled';

-- =====================================================================
-- Table: finance_ppm.invoice_lines
-- Purpose: Line items on invoices (time, expenses, fees)
-- Grain: One row per invoice line item
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.invoice_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  invoice_id        uuid NOT NULL REFERENCES finance_ppm.invoices(id) ON DELETE CASCADE,
  
  -- Line item details
  line_number       int NOT NULL,
  description       text NOT NULL,
  
  -- Quantity & pricing
  quantity          numeric(10,2) NOT NULL,
  unit_of_measure   text,  -- e.g. 'hours', 'each', 'lump sum'
  unit_price        numeric(10,2) NOT NULL,
  line_total        numeric(12,2) NOT NULL,
  
  -- Source tracking
  source_type       text CHECK (source_type IN ('timesheet','expense','fee','other')),
  timesheet_entry_id uuid REFERENCES finance_ppm.timesheet_entries(id) ON DELETE SET NULL,
  expense_line_id   uuid,  -- FK to te.expense_lines (if from T&E app)
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(invoice_id, line_number)
);

-- Indexes for finance_ppm.invoice_lines
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoice_lines_tenant ON finance_ppm.invoice_lines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoice_lines_invoice ON finance_ppm.invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoice_lines_timesheet ON finance_ppm.invoice_lines(timesheet_entry_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_invoice_lines_expense ON finance_ppm.invoice_lines(expense_line_id);

COMMENT ON TABLE finance_ppm.invoice_lines IS 'Invoice line items (time, expenses, fees)';
COMMENT ON COLUMN finance_ppm.invoice_lines.source_type IS 'Source: timesheet, expense, fee, other';
COMMENT ON COLUMN finance_ppm.invoice_lines.timesheet_entry_id IS 'Link to timesheet entry (if line is for billable time)';
COMMENT ON COLUMN finance_ppm.invoice_lines.expense_line_id IS 'Link to T&E expense line (if line is for reimbursable expense)';

-- =====================================================================
-- Table: finance_ppm.payments
-- Purpose: Payment receipts against invoices
-- Grain: One row per payment
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  invoice_id        uuid NOT NULL REFERENCES finance_ppm.invoices(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_date      date NOT NULL,
  amount            numeric(12,2) NOT NULL,
  currency          text NOT NULL DEFAULT 'PHP',
  
  -- Payment method
  payment_method    text CHECK (payment_method IN ('bank_transfer','check','cash','credit_card','other')),
  reference_number  text,  -- Check #, OR #, bank reference, etc.
  
  -- Withholding tax (PH-specific)
  withholding_tax_rate    numeric(5,2) DEFAULT 0,
  withholding_tax_amount  numeric(10,2) DEFAULT 0,
  net_amount              numeric(12,2) GENERATED ALWAYS AS (amount - withholding_tax_amount) STORED,
  
  -- BIR 2307 (Withholding Tax Certificate - Philippines)
  bir_2307_issued   boolean DEFAULT false,
  bir_2307_date     date,
  bir_2307_number   text,
  
  -- Tracking
  recorded_by       uuid NOT NULL,  -- FK to core.users
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  notes             text
);

-- Indexes for finance_ppm.payments
CREATE INDEX IF NOT EXISTS idx_finance_ppm_payments_tenant ON finance_ppm.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_payments_invoice ON finance_ppm.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_payments_date ON finance_ppm.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_payments_method ON finance_ppm.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_payments_created ON finance_ppm.payments(created_at DESC);

COMMENT ON TABLE finance_ppm.payments IS 'Payment receipts against invoices (with PH withholding tax support)';
COMMENT ON COLUMN finance_ppm.payments.withholding_tax_rate IS 'Withholding tax % (1%, 2%, 5%, 10% EWT common in PH)';
COMMENT ON COLUMN finance_ppm.payments.net_amount IS 'Auto-calculated: amount - withholding_tax_amount';
COMMENT ON COLUMN finance_ppm.payments.bir_2307_number IS 'BIR Form 2307 certificate number (Philippines tax compliance)';

-- =====================================================================
-- Table: finance_ppm.wip_entries
-- Purpose: Work-in-progress calculation snapshots (cached for performance)
-- Grain: One row per project per calculation date
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.wip_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  project_id        uuid NOT NULL REFERENCES finance_ppm.projects(id) ON DELETE CASCADE,
  
  -- Calculation date
  calculation_date  date NOT NULL,
  
  -- WIP components
  time_wip          numeric(12,2) NOT NULL DEFAULT 0,    -- Unbilled timesheet value
  expense_wip       numeric(12,2) NOT NULL DEFAULT 0,    -- Unbilled expenses
  fee_wip           numeric(12,2) NOT NULL DEFAULT 0,    -- Unbilled fees
  total_wip         numeric(12,2) GENERATED ALWAYS AS (time_wip + expense_wip + fee_wip) STORED,
  
  -- Aging
  oldest_entry_date date,
  age_days          int GENERATED ALWAYS AS (CURRENT_DATE - oldest_entry_date) STORED,
  age_bucket        text GENERATED ALWAYS AS (
    CASE 
      WHEN oldest_entry_date IS NULL THEN 'none'
      WHEN CURRENT_DATE - oldest_entry_date <= 30 THEN '0-30'
      WHEN CURRENT_DATE - oldest_entry_date BETWEEN 31 AND 60 THEN '31-60'
      WHEN CURRENT_DATE - oldest_entry_date BETWEEN 61 AND 90 THEN '61-90'
      ELSE '90+'
    END
  ) STORED,
  
  -- Status
  ready_to_invoice  boolean NOT NULL DEFAULT false,
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(project_id, calculation_date)
);

-- Indexes for finance_ppm.wip_entries
CREATE INDEX IF NOT EXISTS idx_finance_ppm_wip_entries_tenant ON finance_ppm.wip_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_wip_entries_project ON finance_ppm.wip_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_wip_entries_date ON finance_ppm.wip_entries(calculation_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_wip_entries_age_bucket ON finance_ppm.wip_entries(age_bucket);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_wip_entries_ready ON finance_ppm.wip_entries(ready_to_invoice) WHERE ready_to_invoice = true;

COMMENT ON TABLE finance_ppm.wip_entries IS 'WIP (Work-in-progress) calculation snapshots (recalculated nightly)';
COMMENT ON COLUMN finance_ppm.wip_entries.time_wip IS 'Unbilled time value (approved, billable timesheets not yet invoiced)';
COMMENT ON COLUMN finance_ppm.wip_entries.expense_wip IS 'Unbilled expenses (from T&E app)';
COMMENT ON COLUMN finance_ppm.wip_entries.total_wip IS 'Auto-calculated: time_wip + expense_wip + fee_wip';
COMMENT ON COLUMN finance_ppm.wip_entries.age_bucket IS 'Auto-calculated aging: 0-30, 31-60, 61-90, 90+';

-- =====================================================================
-- Table: finance_ppm.collection_activities
-- Purpose: Track collection efforts for overdue invoices
-- Grain: One row per collection activity
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.collection_activities (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  invoice_id        uuid NOT NULL REFERENCES finance_ppm.invoices(id) ON DELETE CASCADE,
  
  -- Activity
  activity_type     text NOT NULL CHECK (activity_type IN ('call','email','letter','meeting','escalation','legal')),
  activity_date     date NOT NULL,
  outcome           text CHECK (outcome IN ('promise_to_pay','dispute','no_contact','other')),
  
  -- Next action
  next_action       text,
  next_action_date  date,
  
  -- Assignment
  assigned_to       uuid,  -- FK to core.users
  
  -- Tracking
  created_by        uuid NOT NULL,  -- FK to core.users
  created_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  notes             text
);

-- Indexes for finance_ppm.collection_activities
CREATE INDEX IF NOT EXISTS idx_finance_ppm_collection_activities_tenant ON finance_ppm.collection_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_collection_activities_invoice ON finance_ppm.collection_activities(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_collection_activities_assigned ON finance_ppm.collection_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_collection_activities_next_action_date ON finance_ppm.collection_activities(next_action_date);

COMMENT ON TABLE finance_ppm.collection_activities IS 'Collection activities for overdue invoices (calls, emails, escalations)';
COMMENT ON COLUMN finance_ppm.collection_activities.activity_type IS 'Activity type: call, email, letter, meeting, escalation, legal';
COMMENT ON COLUMN finance_ppm.collection_activities.outcome IS 'Activity outcome: promise_to_pay, dispute, no_contact, other';

-- =====================================================================
-- Triggers: Auto-update timestamps and invoice status
-- =====================================================================

DROP TRIGGER IF EXISTS update_finance_ppm_invoices_updated_at ON finance_ppm.invoices;
CREATE TRIGGER update_finance_ppm_invoices_updated_at
  BEFORE UPDATE ON finance_ppm.invoices
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_ppm_payments_updated_at ON finance_ppm.payments;
CREATE TRIGGER update_finance_ppm_payments_updated_at
  BEFORE UPDATE ON finance_ppm.payments
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_ppm_wip_entries_updated_at ON finance_ppm.wip_entries;
CREATE TRIGGER update_finance_ppm_wip_entries_updated_at
  BEFORE UPDATE ON finance_ppm.wip_entries
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- =====================================================================
-- Trigger: Auto-update invoice.paid_amount when payment is recorded
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.update_invoice_paid_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_total_paid numeric;
  v_invoice_total numeric;
  v_new_status text;
BEGIN
  -- Calculate total payments for invoice
  SELECT COALESCE(SUM(net_amount), 0), MAX(i.total_amount)
  INTO v_total_paid, v_invoice_total
  FROM finance_ppm.payments p
  JOIN finance_ppm.invoices i ON p.invoice_id = i.id
  WHERE p.invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Determine new status
  IF v_total_paid >= v_invoice_total THEN
    v_new_status := 'paid';
  ELSIF v_total_paid > 0 THEN
    v_new_status := 'partial';
  ELSE
    v_new_status := 'sent';
  END IF;
  
  -- Update invoice
  UPDATE finance_ppm.invoices
  SET 
    paid_amount = v_total_paid,
    status = v_new_status,
    paid_at = CASE WHEN v_new_status = 'paid' THEN now() ELSE NULL END
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_paid_amount_on_payment ON finance_ppm.payments;
CREATE TRIGGER update_invoice_paid_amount_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON finance_ppm.payments
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_invoice_paid_amount();

-- =====================================================================
-- Trigger: Auto-update invoice status to 'overdue' if past due date
-- (This should be run as a scheduled job, but we'll create the function)
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.mark_invoices_overdue()
RETURNS void AS $$
BEGIN
  UPDATE finance_ppm.invoices
  SET status = 'overdue'
  WHERE status IN ('sent', 'partial')
    AND due_date < CURRENT_DATE
    AND balance > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION finance_ppm.mark_invoices_overdue IS 'Mark invoices as overdue if past due date (run as scheduled job)';

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM Invoicing & AR migration complete:';
  RAISE NOTICE '  - Tables: invoices, invoice_lines, payments, wip_entries, collection_activities (5 tables)';
  RAISE NOTICE '  - Indexes: 34 indexes created';
  RAISE NOTICE '  - Triggers:';
  RAISE NOTICE '    • update_updated_at (3 tables)';
  RAISE NOTICE '    • update_invoice_paid_amount (auto-update paid_amount and status)';
  RAISE NOTICE '  - Generated columns: balance (invoices), net_amount (payments), total_wip, age_bucket (wip_entries)';
  RAISE NOTICE '  - Helper function: mark_invoices_overdue (for scheduled job)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_104_ppm_documents.sql';
END $$;
