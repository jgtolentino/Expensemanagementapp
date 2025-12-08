-- =====================================================================
-- Medallion Architecture - Migration 1: Bronze Layer (Raw Data)
-- =====================================================================
-- Purpose: Create bronze schema for raw, unvalidated data ingestion
-- Dependencies: core.tenants (assumed to exist)
-- Author: IPAI Scout - MCP Marketplace
-- Date: 2025-12-08
-- =====================================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS bronze;

-- Grant usage
GRANT USAGE ON SCHEMA bronze TO authenticated;
GRANT ALL ON SCHEMA bronze TO service_role;

-- =====================================================================
-- BRONZE LAYER: Raw Data Tables
-- These tables store data as-is from source systems with minimal transformation
-- =====================================================================

-- ---------------------------------------------------------------------
-- Bronze: Raw Expense Transactions from Odoo
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bronze.raw_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_system TEXT NOT NULL DEFAULT 'odoo',
  source_id TEXT,  -- Original ID from source system
  raw_payload JSONB NOT NULL,  -- Complete raw JSON from source

  -- Extracted fields for basic queryability
  employee_id TEXT,
  employee_name TEXT,
  expense_date DATE,
  merchant TEXT,
  amount NUMERIC(15, 2),
  currency TEXT DEFAULT 'PHP',
  category_raw TEXT,  -- Raw category from source (not validated)
  description TEXT,
  receipt_url TEXT,

  -- Metadata
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_by TEXT,
  batch_id UUID,  -- For tracking ingestion batches
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_errors JSONB,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_bronze_expenses_tenant ON bronze.raw_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bronze_expenses_date ON bronze.raw_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_bronze_expenses_processed ON bronze.raw_expenses(is_processed) WHERE NOT is_processed;
CREATE INDEX IF NOT EXISTS idx_bronze_expenses_batch ON bronze.raw_expenses(batch_id);

-- ---------------------------------------------------------------------
-- Bronze: Raw PPM Tasks from Odoo/Project Management
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bronze.raw_ppm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_system TEXT NOT NULL DEFAULT 'odoo',
  source_id TEXT,
  raw_payload JSONB NOT NULL,

  -- Extracted fields
  project_id TEXT,
  project_name TEXT,
  task_name TEXT,
  assignee_id TEXT,
  assignee_name TEXT,
  status_raw TEXT,
  priority_raw TEXT,
  due_date DATE,
  estimated_hours NUMERIC(8, 2),
  actual_hours NUMERIC(8, 2),

  -- BIR-specific fields
  bir_form_type TEXT,  -- e.g., '2550M', '2550Q', '1701'
  bir_period TEXT,  -- e.g., '2025-01', '2025-Q1'
  is_bir_related BOOLEAN DEFAULT FALSE,

  -- Metadata
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_by TEXT,
  batch_id UUID,
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_errors JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bronze_ppm_tenant ON bronze.raw_ppm_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bronze_ppm_due_date ON bronze.raw_ppm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_bronze_ppm_bir ON bronze.raw_ppm_tasks(is_bir_related) WHERE is_bir_related;

-- ---------------------------------------------------------------------
-- Bronze: Raw MCP Server Registrations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bronze.raw_mcp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_system TEXT NOT NULL DEFAULT 'marketplace',

  -- MCP Server Info
  provider_id TEXT NOT NULL,
  provider_name TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT,

  -- Installation details
  installation_payload JSONB NOT NULL,
  configuration JSONB,

  -- Status
  action TEXT NOT NULL,  -- 'install', 'uninstall', 'update', 'configure'
  status TEXT DEFAULT 'pending',

  -- Metadata
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_errors JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bronze_mcp_tenant ON bronze.raw_mcp_registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bronze_mcp_product ON bronze.raw_mcp_registrations(product_id);

-- ---------------------------------------------------------------------
-- Bronze: Raw Receipt OCR Results
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bronze.raw_receipt_ocr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Source
  expense_id UUID,  -- Link to raw_expenses if available
  receipt_url TEXT NOT NULL,

  -- OCR Output
  ocr_provider TEXT DEFAULT 'azure',
  ocr_raw_response JSONB NOT NULL,

  -- Extracted (unvalidated) fields
  detected_merchant TEXT,
  detected_amount NUMERIC(15, 2),
  detected_date DATE,
  detected_items JSONB,  -- Array of line items
  confidence_score NUMERIC(3, 2),  -- 0.00 to 1.00

  -- Metadata
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_errors JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bronze_ocr_tenant ON bronze.raw_receipt_ocr(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bronze_ocr_expense ON bronze.raw_receipt_ocr(expense_id);

-- ---------------------------------------------------------------------
-- Bronze: Raw LLM Requests (for AI observability)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bronze.raw_llm_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Request Info
  agent_type TEXT NOT NULL,  -- 'expense_classifier', 'bir_task_creator', etc.
  model TEXT NOT NULL,  -- 'gpt-4', 'claude-3', etc.

  -- Input/Output
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  latency_ms INTEGER,

  -- Payload (may be truncated for large prompts)
  request_payload JSONB,
  response_payload JSONB,

  -- Status
  status TEXT DEFAULT 'success',  -- 'success', 'error', 'timeout'
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id UUID,
  trace_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_bronze_llm_tenant ON bronze.raw_llm_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bronze_llm_agent ON bronze.raw_llm_requests(agent_type);
CREATE INDEX IF NOT EXISTS idx_bronze_llm_created ON bronze.raw_llm_requests(created_at);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE bronze.raw_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bronze.raw_ppm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bronze.raw_mcp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bronze.raw_receipt_ocr ENABLE ROW LEVEL SECURITY;
ALTER TABLE bronze.raw_llm_requests ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_expenses ON bronze.raw_expenses
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_ppm ON bronze.raw_ppm_tasks
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_mcp ON bronze.raw_mcp_registrations
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_ocr ON bronze.raw_receipt_ocr
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_llm ON bronze.raw_llm_requests
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA bronze TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA bronze TO service_role;

COMMENT ON SCHEMA bronze IS 'Bronze layer: Raw, unvalidated data from source systems';
