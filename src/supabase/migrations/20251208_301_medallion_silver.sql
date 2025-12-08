-- =====================================================================
-- Medallion Architecture - Migration 2: Silver Layer (Validated Data)
-- =====================================================================
-- Purpose: Create silver schema for cleaned, validated, and standardized data
-- Dependencies: bronze schema
-- Author: IPAI Scout - MCP Marketplace
-- Date: 2025-12-08
-- =====================================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS silver;

-- Grant usage
GRANT USAGE ON SCHEMA silver TO authenticated;
GRANT ALL ON SCHEMA silver TO service_role;

-- =====================================================================
-- ENUMS for standardized values
-- =====================================================================

-- Expense Categories (BIR-aligned)
CREATE TYPE silver.expense_category_enum AS ENUM (
  'transportation',
  'accommodation',
  'meals_entertainment',
  'office_supplies',
  'professional_services',
  'utilities',
  'telecommunications',
  'travel',
  'training_education',
  'marketing_advertising',
  'equipment_rental',
  'maintenance_repairs',
  'insurance',
  'taxes_licenses',
  'miscellaneous'
);

-- Expense Status
CREATE TYPE silver.expense_status_enum AS ENUM (
  'draft',
  'submitted',
  'pending_approval',
  'approved',
  'rejected',
  'reimbursed',
  'cancelled'
);

-- PPM Task Status
CREATE TYPE silver.task_status_enum AS ENUM (
  'not_started',
  'in_progress',
  'blocked',
  'review',
  'completed',
  'cancelled'
);

-- BIR Form Types
CREATE TYPE silver.bir_form_enum AS ENUM (
  '1601C',   -- Monthly Withholding Tax
  '1601EQ',  -- Quarterly Expanded Withholding Tax
  '1701',    -- Annual Income Tax Return
  '1702Q',   -- Quarterly Income Tax Return
  '2550M',   -- Monthly VAT Return
  '2550Q',   -- Quarterly VAT Return
  '2551Q',   -- Quarterly Percentage Tax Return
  '0619E',   -- Monthly Expanded Withholding Tax Remittance
  '1604E',   -- Annual Expanded Withholding Tax Return
  'other'
);

-- MCP Installation Status
CREATE TYPE silver.mcp_status_enum AS ENUM (
  'pending',
  'active',
  'suspended',
  'uninstalled',
  'error'
);

-- =====================================================================
-- SILVER LAYER: Validated & Standardized Tables
-- =====================================================================

-- ---------------------------------------------------------------------
-- Silver: Validated Expenses
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silver.validated_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bronze_id UUID REFERENCES bronze.raw_expenses(id) ON DELETE SET NULL,

  -- Employee Info (validated)
  employee_id UUID,  -- Link to core.users
  employee_name TEXT NOT NULL,
  department TEXT,

  -- Expense Details (validated)
  expense_date DATE NOT NULL,
  merchant TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'PHP',
  category silver.expense_category_enum NOT NULL,
  subcategory TEXT,
  description TEXT,

  -- Receipt Info
  receipt_id UUID,  -- Link to validated_receipts
  has_valid_receipt BOOLEAN DEFAULT FALSE,

  -- Approval Workflow
  status silver.expense_status_enum NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- BIR Tax Mapping
  is_tax_deductible BOOLEAN DEFAULT TRUE,
  bir_category TEXT,  -- BIR expense classification
  vat_amount NUMERIC(15, 2) DEFAULT 0,

  -- Validation
  validation_score NUMERIC(3, 2),  -- 0.00 to 1.00
  validation_notes JSONB,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_silver_expenses_tenant ON silver.validated_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_silver_expenses_employee ON silver.validated_expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_silver_expenses_date ON silver.validated_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_silver_expenses_status ON silver.validated_expenses(status);
CREATE INDEX IF NOT EXISTS idx_silver_expenses_category ON silver.validated_expenses(category);

-- ---------------------------------------------------------------------
-- Silver: Validated PPM Tasks
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silver.validated_ppm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bronze_id UUID REFERENCES bronze.raw_ppm_tasks(id) ON DELETE SET NULL,

  -- Project Info
  project_id UUID,
  project_name TEXT NOT NULL,
  project_code TEXT,

  -- Task Details
  task_name TEXT NOT NULL,
  task_description TEXT,
  assignee_id UUID,
  assignee_name TEXT,

  -- Status & Priority
  status silver.task_status_enum NOT NULL DEFAULT 'not_started',
  priority INTEGER CHECK (priority BETWEEN 1 AND 5),  -- 1=highest, 5=lowest

  -- Timeline
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  estimated_hours NUMERIC(8, 2),
  actual_hours NUMERIC(8, 2),

  -- BIR Compliance
  is_bir_task BOOLEAN DEFAULT FALSE,
  bir_form_type silver.bir_form_enum,
  bir_period TEXT,  -- '2025-01' for monthly, '2025-Q1' for quarterly
  bir_deadline DATE,
  compliance_status TEXT,  -- 'on_track', 'at_risk', 'overdue', 'completed'

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_silver_ppm_tenant ON silver.validated_ppm_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_silver_ppm_project ON silver.validated_ppm_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_silver_ppm_assignee ON silver.validated_ppm_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_silver_ppm_due_date ON silver.validated_ppm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_silver_ppm_bir ON silver.validated_ppm_tasks(is_bir_task) WHERE is_bir_task;

-- ---------------------------------------------------------------------
-- Silver: Validated MCP Installations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silver.validated_mcp_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bronze_id UUID REFERENCES bronze.raw_mcp_registrations(id) ON DELETE SET NULL,

  -- Provider & Product
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_version TEXT,

  -- Installation
  status silver.mcp_status_enum NOT NULL DEFAULT 'pending',
  installed_at TIMESTAMPTZ,
  installed_by UUID,

  -- Configuration
  configuration JSONB,
  capabilities_enabled JSONB,  -- Array of enabled capability IDs

  -- Usage Tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_silver_mcp_tenant ON silver.validated_mcp_installations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_silver_mcp_product ON silver.validated_mcp_installations(product_id);
CREATE INDEX IF NOT EXISTS idx_silver_mcp_status ON silver.validated_mcp_installations(status);

-- ---------------------------------------------------------------------
-- Silver: Validated Receipts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silver.validated_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bronze_ocr_id UUID REFERENCES bronze.raw_receipt_ocr(id) ON DELETE SET NULL,

  -- Receipt Image
  receipt_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Validated OCR Data
  merchant TEXT,
  transaction_date DATE,
  total_amount NUMERIC(15, 2),
  currency TEXT DEFAULT 'PHP',

  -- Line Items
  line_items JSONB,  -- Array of {description, quantity, unit_price, amount}

  -- Tax Info
  vat_amount NUMERIC(15, 2),
  vat_registration_number TEXT,
  official_receipt_number TEXT,

  -- Validation
  ocr_confidence NUMERIC(3, 2),
  is_manually_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID,
  verified_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_silver_receipts_tenant ON silver.validated_receipts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_silver_receipts_date ON silver.validated_receipts(transaction_date);

-- =====================================================================
-- BIR SCHEDULE REFERENCE TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS silver.bir_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Form Details
  form_type silver.bir_form_enum NOT NULL,
  form_name TEXT NOT NULL,
  description TEXT,

  -- Schedule
  frequency TEXT NOT NULL,  -- 'monthly', 'quarterly', 'annual'
  due_day INTEGER,  -- Day of month when due (e.g., 20 for 20th)
  quarter_months INTEGER[],  -- For quarterly: months when due [1,4,7,10]

  -- Reminders
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],  -- Days before deadline

  -- Active period
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populate BIR schedule
INSERT INTO silver.bir_schedule (tenant_id, form_type, form_name, description, frequency, due_day, quarter_months)
VALUES
  ('00000000-0000-0000-0000-000000000000', '2550M', 'Monthly VAT Return', 'Value Added Tax monthly declaration', 'monthly', 20, NULL),
  ('00000000-0000-0000-0000-000000000000', '2550Q', 'Quarterly VAT Return', 'Value Added Tax quarterly declaration', 'quarterly', 25, ARRAY[1,4,7,10]),
  ('00000000-0000-0000-0000-000000000000', '1601C', 'Monthly Withholding Tax', 'Compensation withholding tax', 'monthly', 10, NULL),
  ('00000000-0000-0000-0000-000000000000', '1601EQ', 'Quarterly EWT Return', 'Expanded withholding tax quarterly', 'quarterly', 28, ARRAY[1,4,7,10]),
  ('00000000-0000-0000-0000-000000000000', '1701', 'Annual Income Tax', 'Annual income tax return for individuals', 'annual', 15, ARRAY[4]),
  ('00000000-0000-0000-0000-000000000000', '1702Q', 'Quarterly Income Tax', 'Quarterly income tax return for corporations', 'quarterly', 60, ARRAY[4,7,10,1])
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE silver.validated_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE silver.validated_ppm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE silver.validated_mcp_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE silver.validated_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE silver.bir_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_expenses ON silver.validated_expenses
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_ppm ON silver.validated_ppm_tasks
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_mcp ON silver.validated_mcp_installations
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_receipts ON silver.validated_receipts
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_bir ON silver.bir_schedule
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    OR tenant_id = '00000000-0000-0000-0000-000000000000'  -- Global defaults
  );

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA silver TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA silver TO service_role;

COMMENT ON SCHEMA silver IS 'Silver layer: Validated, cleaned, and standardized data';
