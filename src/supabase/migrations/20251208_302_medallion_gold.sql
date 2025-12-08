-- =====================================================================
-- Medallion Architecture - Migration 3: Gold Layer (Aggregated Analytics)
-- =====================================================================
-- Purpose: Create gold schema for business-ready aggregations and metrics
-- Dependencies: silver schema
-- Author: IPAI Scout - MCP Marketplace
-- Date: 2025-12-08
-- =====================================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS gold;

-- Grant usage
GRANT USAGE ON SCHEMA gold TO authenticated;
GRANT ALL ON SCHEMA gold TO service_role;

-- =====================================================================
-- GOLD LAYER: Aggregated Business Metrics
-- =====================================================================

-- ---------------------------------------------------------------------
-- Gold: Monthly Expense Summary
-- Aggregated expense data by month, category, and department
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold.monthly_expense_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Time Dimension
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Dimensions
  department TEXT,
  category TEXT,
  employee_id UUID,

  -- Metrics
  total_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0,
  approved_expenses NUMERIC(15, 2) DEFAULT 0,
  pending_expenses NUMERIC(15, 2) DEFAULT 0,
  rejected_expenses NUMERIC(15, 2) DEFAULT 0,
  reimbursed_expenses NUMERIC(15, 2) DEFAULT 0,

  transaction_count INTEGER DEFAULT 0,
  approved_count INTEGER DEFAULT 0,
  rejected_count INTEGER DEFAULT 0,

  -- Tax Metrics
  vat_total NUMERIC(15, 2) DEFAULT 0,
  deductible_total NUMERIC(15, 2) DEFAULT 0,
  non_deductible_total NUMERIC(15, 2) DEFAULT 0,

  -- Compliance
  avg_approval_time_hours NUMERIC(8, 2),
  policy_violation_count INTEGER DEFAULT 0,

  -- Audit
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, year, month, department, category, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_gold_expense_tenant ON gold.monthly_expense_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gold_expense_period ON gold.monthly_expense_summary(year, month);
CREATE INDEX IF NOT EXISTS idx_gold_expense_dept ON gold.monthly_expense_summary(department);

-- ---------------------------------------------------------------------
-- Gold: PPM Compliance Metrics
-- BIR and project compliance tracking
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold.ppm_compliance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Time Dimension
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  quarter INTEGER,

  -- BIR Metrics
  bir_forms_due INTEGER DEFAULT 0,
  bir_forms_completed INTEGER DEFAULT 0,
  bir_forms_overdue INTEGER DEFAULT 0,
  bir_compliance_rate NUMERIC(5, 2),  -- Percentage

  -- Task Metrics
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  blocked_tasks INTEGER DEFAULT 0,

  -- Time Metrics
  avg_completion_days NUMERIC(8, 2),
  earliest_completion DATE,
  latest_deadline DATE,

  -- By Form Type (JSONB for flexibility)
  form_type_breakdown JSONB,
  -- e.g., {"2550M": {"due": 1, "completed": 1}, "1601C": {"due": 1, "completed": 0}}

  -- Audit
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_gold_compliance_tenant ON gold.ppm_compliance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gold_compliance_period ON gold.ppm_compliance_metrics(year, month);

-- ---------------------------------------------------------------------
-- Gold: Category Trends
-- Expense category trends over time
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold.category_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Time Dimension
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,

  -- Category
  category TEXT NOT NULL,

  -- Current Period Metrics
  current_total NUMERIC(15, 2) DEFAULT 0,
  current_count INTEGER DEFAULT 0,
  current_avg_amount NUMERIC(15, 2) DEFAULT 0,

  -- Previous Period (for comparison)
  previous_total NUMERIC(15, 2) DEFAULT 0,
  previous_count INTEGER DEFAULT 0,

  -- Trend Calculations
  mom_change_pct NUMERIC(8, 2),  -- Month-over-month change %
  yoy_change_pct NUMERIC(8, 2),  -- Year-over-year change %
  trend_direction TEXT,  -- 'up', 'down', 'stable'

  -- Budget Comparison
  budget_amount NUMERIC(15, 2),
  budget_variance NUMERIC(15, 2),
  budget_utilization_pct NUMERIC(8, 2),

  -- Audit
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, year, month, category)
);

CREATE INDEX IF NOT EXISTS idx_gold_trends_tenant ON gold.category_trends(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gold_trends_period ON gold.category_trends(year, month);
CREATE INDEX IF NOT EXISTS idx_gold_trends_category ON gold.category_trends(category);

-- ---------------------------------------------------------------------
-- Gold: MCP Usage Analytics
-- MCP Server usage and performance metrics
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold.mcp_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Time Dimension
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  week INTEGER,

  -- Product
  product_id TEXT NOT NULL,
  product_name TEXT,
  provider_name TEXT,

  -- Usage Metrics
  total_invocations INTEGER DEFAULT 0,
  successful_invocations INTEGER DEFAULT 0,
  failed_invocations INTEGER DEFAULT 0,
  success_rate NUMERIC(5, 2),

  -- Performance Metrics
  avg_latency_ms NUMERIC(10, 2),
  p50_latency_ms NUMERIC(10, 2),
  p95_latency_ms NUMERIC(10, 2),
  p99_latency_ms NUMERIC(10, 2),

  -- Token Usage (for AI-based MCPs)
  total_prompt_tokens INTEGER DEFAULT 0,
  total_completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 4),

  -- User Metrics
  unique_users INTEGER DEFAULT 0,
  active_installations INTEGER DEFAULT 0,

  -- Capability Breakdown
  capability_usage JSONB,
  -- e.g., {"get-financials": 150, "get-estimates": 75}

  -- Audit
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, year, month, product_id)
);

CREATE INDEX IF NOT EXISTS idx_gold_mcp_tenant ON gold.mcp_usage_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gold_mcp_period ON gold.mcp_usage_analytics(year, month);
CREATE INDEX IF NOT EXISTS idx_gold_mcp_product ON gold.mcp_usage_analytics(product_id);

-- ---------------------------------------------------------------------
-- Gold: Employee Expense Patterns
-- Individual employee spending patterns and anomalies
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold.employee_expense_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Employee
  employee_id UUID NOT NULL,
  employee_name TEXT,
  department TEXT,

  -- Time Period
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,

  -- Spending Patterns
  total_expenses NUMERIC(15, 2) DEFAULT 0,
  avg_expense_amount NUMERIC(15, 2) DEFAULT 0,
  max_expense_amount NUMERIC(15, 2) DEFAULT 0,
  expense_count INTEGER DEFAULT 0,

  -- Category Distribution
  top_categories JSONB,  -- Array of {category, amount, percentage}

  -- Compliance
  approval_rate NUMERIC(5, 2),
  avg_days_to_submit INTEGER,
  policy_violations INTEGER DEFAULT 0,

  -- Anomaly Detection
  is_anomaly BOOLEAN DEFAULT FALSE,
  anomaly_score NUMERIC(5, 2),
  anomaly_reasons JSONB,

  -- Comparison to Peers
  peer_avg NUMERIC(15, 2),
  deviation_from_peer_pct NUMERIC(8, 2),

  -- Audit
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, employee_id, year, quarter)
);

CREATE INDEX IF NOT EXISTS idx_gold_patterns_tenant ON gold.employee_expense_patterns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gold_patterns_employee ON gold.employee_expense_patterns(employee_id);
CREATE INDEX IF NOT EXISTS idx_gold_patterns_anomaly ON gold.employee_expense_patterns(is_anomaly) WHERE is_anomaly;

-- =====================================================================
-- MATERIALIZED VIEWS for Real-Time Dashboards
-- =====================================================================

-- Current Month Expense Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS gold.mv_current_month_expenses AS
SELECT
  tenant_id,
  category,
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM silver.validated_expenses
WHERE expense_date >= date_trunc('month', CURRENT_DATE)
  AND expense_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
GROUP BY tenant_id, category, status;

-- Upcoming BIR Deadlines (next 30 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS gold.mv_upcoming_bir_deadlines AS
SELECT
  t.tenant_id,
  t.id as task_id,
  t.task_name,
  t.bir_form_type,
  t.bir_period,
  t.bir_deadline,
  t.status,
  t.assignee_name,
  t.bir_deadline - CURRENT_DATE as days_until_due,
  CASE
    WHEN t.bir_deadline < CURRENT_DATE THEN 'overdue'
    WHEN t.bir_deadline - CURRENT_DATE <= 3 THEN 'critical'
    WHEN t.bir_deadline - CURRENT_DATE <= 7 THEN 'warning'
    ELSE 'on_track'
  END as urgency
FROM silver.validated_ppm_tasks t
WHERE t.is_bir_task = true
  AND t.status != 'completed'
  AND t.bir_deadline <= CURRENT_DATE + interval '30 days';

-- Top MCP Products by Usage
CREATE MATERIALIZED VIEW IF NOT EXISTS gold.mv_top_mcp_products AS
SELECT
  tenant_id,
  product_id,
  product_name,
  provider_name,
  status,
  usage_count,
  last_used_at
FROM silver.validated_mcp_installations
WHERE status = 'active'
ORDER BY usage_count DESC;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE gold.monthly_expense_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.ppm_compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.category_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.mcp_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.employee_expense_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_expense_summary ON gold.monthly_expense_summary
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_compliance ON gold.ppm_compliance_metrics
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_trends ON gold.category_trends
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_mcp_analytics ON gold.mcp_usage_analytics
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_patterns ON gold.employee_expense_patterns
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA gold TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA gold TO service_role;

COMMENT ON SCHEMA gold IS 'Gold layer: Business-ready aggregations and analytics';
