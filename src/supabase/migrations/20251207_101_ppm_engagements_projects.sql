-- =====================================================================
-- Finance PPM: Engagements & Projects Schema
-- Migration: 20251207_101_ppm_engagements_projects.sql
-- Description: Create core PPM tables (engagements, projects, tasks, financials)
-- Dependencies: 20251207_100_ppm_crm_schema.sql
-- =====================================================================

-- Create finance_ppm schema if not exists
CREATE SCHEMA IF NOT EXISTS finance_ppm;

COMMENT ON SCHEMA finance_ppm IS 'Finance PPM - Project Portfolio Management for accounting firm workflows';

-- =====================================================================
-- Table: finance_ppm.engagements
-- Purpose: High-level client engagements (contracts) containing projects
-- Grain: One row per engagement
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.engagements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Link to CRM
  crm_opportunity_id uuid REFERENCES crm.opportunities(id) ON DELETE SET NULL,
  
  -- Engagement information
  engagement_code   text UNIQUE NOT NULL,
  engagement_name   text NOT NULL,
  client_name       text NOT NULL,
  client_id         uuid,  -- Future: FK to core.clients
  
  -- Type & classification
  engagement_type   text NOT NULL CHECK (engagement_type IN ('project','retainer','time_materials','milestone')),
  service_line      text,  -- e.g. 'Creative', 'Digital', 'Strategy'
  portfolio         text,  -- e.g. 'Consumer Tech', 'Healthcare'
  region            text NOT NULL DEFAULT 'PH',
  
  -- Dates
  start_date        date,
  end_date          date,
  
  -- Commercial
  contract_value    numeric(12,2),
  currency          text NOT NULL DEFAULT 'PHP',
  
  -- Status
  status            text NOT NULL CHECK (status IN ('draft','active','on_hold','closed','cancelled')) DEFAULT 'draft',
  
  -- Ownership
  owner_id          uuid NOT NULL,  -- FK to core.users (Account Manager)
  partner_id        uuid,  -- FK to core.users (Partner responsible)
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  description       text,
  notes             text,
  tags              text[]
);

-- Indexes for finance_ppm.engagements
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_tenant ON finance_ppm.engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_code ON finance_ppm.engagements(engagement_code);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_client ON finance_ppm.engagements(client_name);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_status ON finance_ppm.engagements(status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_owner ON finance_ppm.engagements(owner_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_opportunity ON finance_ppm.engagements(crm_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_engagements_created ON finance_ppm.engagements(created_at DESC);

COMMENT ON TABLE finance_ppm.engagements IS 'High-level client engagements (contracts) containing one or more projects';
COMMENT ON COLUMN finance_ppm.engagements.engagement_type IS 'Billing model: project, retainer, time_materials, milestone';
COMMENT ON COLUMN finance_ppm.engagements.status IS 'Engagement status: draft, active, on_hold, closed, cancelled';

-- =====================================================================
-- Table: finance_ppm.projects
-- Purpose: Delivery units under engagements (project-level scope)
-- Grain: One row per project
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.projects (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Parent engagement
  engagement_id     uuid NOT NULL REFERENCES finance_ppm.engagements(id) ON DELETE CASCADE,
  
  -- Project information
  project_code      text UNIQUE NOT NULL,
  project_name      text NOT NULL,
  
  -- Dates
  start_date        date,
  end_date          date,
  
  -- Type
  billing_type      text CHECK (billing_type IN ('fixed_fee','retainer','time_materials','milestone')),
  service_line      text,
  
  -- Status
  status            text NOT NULL CHECK (status IN ('planned','active','on_hold','closed','cancelled')) DEFAULT 'planned',
  
  -- Ownership
  owner_id          uuid NOT NULL,  -- FK to core.users (PM responsible)
  
  -- Integration
  procure_quote_id  uuid,  -- FK to procure.project_quotes (if quote exists)
  agency_campaign_id uuid,  -- FK to agency.campaigns (if linked)
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  description       text,
  notes             text,
  tags              text[]
);

-- Indexes for finance_ppm.projects
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_tenant ON finance_ppm.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_code ON finance_ppm.projects(project_code);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_engagement ON finance_ppm.projects(engagement_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_status ON finance_ppm.projects(status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_owner ON finance_ppm.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_quote ON finance_ppm.projects(procure_quote_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_campaign ON finance_ppm.projects(agency_campaign_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_projects_created ON finance_ppm.projects(created_at DESC);

COMMENT ON TABLE finance_ppm.projects IS 'Projects (delivery units) under engagements';
COMMENT ON COLUMN finance_ppm.projects.billing_type IS 'Billing model: fixed_fee, retainer, time_materials, milestone';
COMMENT ON COLUMN finance_ppm.projects.procure_quote_id IS 'Link to Procure quote (if budget came from Procure app)';
COMMENT ON COLUMN finance_ppm.projects.agency_campaign_id IS 'Link to Agency campaign (if project is part of campaign)';

-- =====================================================================
-- Table: finance_ppm.tasks
-- Purpose: Task-level work items under projects
-- Grain: One row per task
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.tasks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  project_id        uuid NOT NULL REFERENCES finance_ppm.projects(id) ON DELETE CASCADE,
  
  -- Task information
  task_name         text NOT NULL,
  description       text,
  
  -- Scheduling
  start_date        date,
  due_date          date,
  
  -- Estimation
  estimated_hours   numeric(6,2),
  actual_hours      numeric(6,2) DEFAULT 0,
  
  -- Status
  status            text NOT NULL CHECK (status IN ('todo','in_progress','blocked','done','cancelled')) DEFAULT 'todo',
  priority          text CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  
  -- Assignment
  assigned_to       uuid,  -- FK to core.users
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz,
  
  -- Metadata
  tags              text[]
);

-- Indexes for finance_ppm.tasks
CREATE INDEX IF NOT EXISTS idx_finance_ppm_tasks_tenant ON finance_ppm.tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_tasks_project ON finance_ppm.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_tasks_status ON finance_ppm.tasks(status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_tasks_assigned ON finance_ppm.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_tasks_due_date ON finance_ppm.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_tasks_created ON finance_ppm.tasks(created_at DESC);

COMMENT ON TABLE finance_ppm.tasks IS 'Tasks (work items) under projects';
COMMENT ON COLUMN finance_ppm.tasks.status IS 'Task status: todo, in_progress, blocked, done, cancelled';
COMMENT ON COLUMN finance_ppm.tasks.actual_hours IS 'Actual hours (auto-updated from timesheet entries)';

-- =====================================================================
-- Table: finance_ppm.project_financials
-- Purpose: Monthly financial snapshots (budget, actual, revenue, margin, WIP)
-- Grain: One row per project per month
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.project_financials (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  project_id        uuid NOT NULL REFERENCES finance_ppm.projects(id) ON DELETE CASCADE,
  
  -- Period
  period_month      date NOT NULL,  -- YYYY-MM-01 (first day of month)
  
  -- Budgets
  budget_amount     numeric(12,2) NOT NULL DEFAULT 0,
  forecast_amount   numeric(12,2),
  
  -- Actuals
  actual_cost       numeric(12,2) NOT NULL DEFAULT 0,  -- Internal cost
  revenue           numeric(12,2) NOT NULL DEFAULT 0,  -- Billed revenue
  
  -- Derived metrics (generated columns)
  margin_amount     numeric(12,2) GENERATED ALWAYS AS (revenue - actual_cost) STORED,
  margin_pct        numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN revenue > 0 THEN ((revenue - actual_cost) / revenue) * 100
      ELSE 0
    END
  ) STORED,
  
  variance_amount   numeric(12,2) GENERATED ALWAYS AS (budget_amount - actual_cost) STORED,
  variance_pct      numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN budget_amount > 0 THEN ((budget_amount - actual_cost) / budget_amount) * 100
      ELSE 0
    END
  ) STORED,
  
  -- WIP
  wip_amount        numeric(12,2) DEFAULT 0,  -- Unbilled work in progress
  
  -- Revenue recognition
  revenue_recognized numeric(12,2) DEFAULT 0,
  deferred_revenue  numeric(12,2) DEFAULT 0,
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(project_id, period_month)
);

-- Indexes for finance_ppm.project_financials
CREATE INDEX IF NOT EXISTS idx_finance_ppm_project_financials_tenant ON finance_ppm.project_financials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_project_financials_project ON finance_ppm.project_financials(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_project_financials_period ON finance_ppm.project_financials(period_month);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_project_financials_project_period ON finance_ppm.project_financials(project_id, period_month);

COMMENT ON TABLE finance_ppm.project_financials IS 'Monthly financial snapshots per project (budget, actual, revenue, margin, WIP)';
COMMENT ON COLUMN finance_ppm.project_financials.period_month IS 'First day of month (YYYY-MM-01)';
COMMENT ON COLUMN finance_ppm.project_financials.margin_pct IS 'Profit margin % (auto-calculated)';
COMMENT ON COLUMN finance_ppm.project_financials.variance_pct IS 'Budget variance % (auto-calculated)';

-- =====================================================================
-- Triggers: Auto-update updated_at timestamps
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for finance_ppm.engagements
DROP TRIGGER IF EXISTS update_finance_ppm_engagements_updated_at ON finance_ppm.engagements;
CREATE TRIGGER update_finance_ppm_engagements_updated_at
  BEFORE UPDATE ON finance_ppm.engagements
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- Trigger for finance_ppm.projects
DROP TRIGGER IF EXISTS update_finance_ppm_projects_updated_at ON finance_ppm.projects;
CREATE TRIGGER update_finance_ppm_projects_updated_at
  BEFORE UPDATE ON finance_ppm.projects
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- Trigger for finance_ppm.tasks
DROP TRIGGER IF EXISTS update_finance_ppm_tasks_updated_at ON finance_ppm.tasks;
CREATE TRIGGER update_finance_ppm_tasks_updated_at
  BEFORE UPDATE ON finance_ppm.tasks
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- Trigger for finance_ppm.project_financials
DROP TRIGGER IF EXISTS update_finance_ppm_project_financials_updated_at ON finance_ppm.project_financials;
CREATE TRIGGER update_finance_ppm_project_financials_updated_at
  BEFORE UPDATE ON finance_ppm.project_financials
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- =====================================================================
-- Add FK constraint to crm.opportunities (convert to engagement)
-- =====================================================================

DO $$ 
BEGIN
  -- Add FK from crm.opportunities.converted_to_engagement_id → finance_ppm.engagements.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_opportunities_converted_to_engagement'
  ) THEN
    ALTER TABLE crm.opportunities
    ADD CONSTRAINT fk_opportunities_converted_to_engagement
    FOREIGN KEY (converted_to_engagement_id) 
    REFERENCES finance_ppm.engagements(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Foreign key added: crm.opportunities.converted_to_engagement_id → finance_ppm.engagements.id';
  END IF;
END $$;

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM Engagements & Projects migration complete:';
  RAISE NOTICE '  - Schema: finance_ppm (created)';
  RAISE NOTICE '  - Tables: engagements, projects, tasks, project_financials (4 tables)';
  RAISE NOTICE '  - Indexes: 32 indexes created';
  RAISE NOTICE '  - Triggers: 4 updated_at triggers created';
  RAISE NOTICE '  - Generated columns: margin_amount, margin_pct, variance_amount, variance_pct';
  RAISE NOTICE '  - Foreign keys: engagement_id → engagements(id), project_id → projects(id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_102_ppm_timesheets.sql';
END $$;
