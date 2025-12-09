-- ============================================
-- TBWA PPM - Production Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor AFTER exporting from Figma Make
-- This creates the tables needed to store CSV data

-- ============================================
-- 1. PORTFOLIOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID, -- Foreign key to res_company if multi-tenant
  active BOOLEAN DEFAULT TRUE,
  budget_total NUMERIC(12,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Unique constraint for upsert functionality
  CONSTRAINT project_portfolio_name_unique UNIQUE (name)
);

-- ============================================
-- 2. RISK REGISTER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_risk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id TEXT UNIQUE NOT NULL, -- e.g., "RISK-001"
  title TEXT NOT NULL,
  description TEXT,
  portfolio_id UUID REFERENCES project_portfolio(id) ON DELETE SET NULL,
  project_id UUID, -- Could reference project_project if you have it
  task_id UUID, -- Could reference project_task if you have it
  
  -- Risk Classification
  category TEXT CHECK (category IN ('Technical', 'Financial', 'Operational', 'Compliance', 'Strategic')),
  
  -- Risk Scoring
  probability TEXT CHECK (probability IN ('Very Low', 'Low', 'Medium', 'High', 'Very High')),
  impact TEXT CHECK (impact IN ('Very Low', 'Low', 'Medium', 'High', 'Very High')),
  risk_score INT CHECK (risk_score BETWEEN 1 AND 25),
  exposure_level TEXT CHECK (exposure_level IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- Status & Tracking
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Mitigated', 'Accepted', 'Closed')),
  owner TEXT, -- Employee name or user_id
  mitigation_plan TEXT,
  
  -- Dates
  identified_date DATE,
  review_date DATE,
  closed_date DATE,
  
  -- Metadata
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Add index for faster lookups
CREATE INDEX idx_risk_portfolio ON project_risk(portfolio_id);
CREATE INDEX idx_risk_status ON project_risk(status);
CREATE INDEX idx_risk_exposure ON project_risk(exposure_level);

-- ============================================
-- 3. TIME ENTRIES TABLE (Analytic Lines)
-- ============================================
CREATE TABLE IF NOT EXISTS account_analytic_line (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id TEXT UNIQUE NOT NULL, -- e.g., "TIME-001"
  
  -- Project/Task Linkage
  portfolio_id UUID REFERENCES project_portfolio(id) ON DELETE SET NULL,
  project_id UUID, -- Could reference project_project
  task_id TEXT NOT NULL, -- e.g., "TAX-001" (from your planner tasks)
  
  -- Employee & Time
  employee_name TEXT NOT NULL,
  employee_id UUID, -- Could reference res_users
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL CHECK (hours > 0),
  
  -- Costing
  hourly_rate NUMERIC(8,2) NOT NULL,
  total_cost NUMERIC(10,2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
  
  -- Description & Billing
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Add indexes for common queries
CREATE INDEX idx_time_task ON account_analytic_line(task_id);
CREATE INDEX idx_time_date ON account_analytic_line(date);
CREATE INDEX idx_time_employee ON account_analytic_line(employee_name);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (Multi-Tenant)
-- ============================================
ALTER TABLE project_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_analytic_line ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES (Basic - Expand as needed)
-- ============================================

-- Portfolio Policies
CREATE POLICY "Users can view portfolios in their company"
  ON project_portfolio FOR SELECT
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can insert portfolios in their company"
  ON project_portfolio FOR INSERT
  WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can update portfolios in their company"
  ON project_portfolio FOR UPDATE
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Risk Policies
CREATE POLICY "Users can view risks in their company"
  ON project_risk FOR SELECT
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can insert risks in their company"
  ON project_risk FOR INSERT
  WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can update risks in their company"
  ON project_risk FOR UPDATE
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Time Entry Policies
CREATE POLICY "Users can view time entries in their company"
  ON account_analytic_line FOR SELECT
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can insert time entries in their company"
  ON account_analytic_line FOR INSERT
  WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "Users can update time entries in their company"
  ON account_analytic_line FOR UPDATE
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score(
  prob TEXT, 
  imp TEXT
) RETURNS INT AS $$
DECLARE
  prob_val INT;
  impact_val INT;
BEGIN
  prob_val := CASE prob
    WHEN 'Very Low' THEN 1
    WHEN 'Low' THEN 2
    WHEN 'Medium' THEN 3
    WHEN 'High' THEN 4
    WHEN 'Very High' THEN 5
  END;
  
  impact_val := CASE imp
    WHEN 'Very Low' THEN 1
    WHEN 'Low' THEN 2
    WHEN 'Medium' THEN 3
    WHEN 'High' THEN 4
    WHEN 'Very High' THEN 5
  END;
  
  RETURN prob_val * impact_val;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine exposure level
CREATE OR REPLACE FUNCTION calculate_exposure_level(score INT) RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN score >= 20 THEN 'Critical'
    WHEN score >= 12 THEN 'High'
    WHEN score >= 6 THEN 'Medium'
    ELSE 'Low'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate risk score on insert/update
CREATE OR REPLACE FUNCTION update_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_score := calculate_risk_score(NEW.probability, NEW.impact);
  NEW.exposure_level := calculate_exposure_level(NEW.risk_score);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER risk_score_trigger
  BEFORE INSERT OR UPDATE ON project_risk
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_score();

-- Trigger to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_timestamp
  BEFORE UPDATE ON project_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entry_timestamp
  BEFORE UPDATE ON account_analytic_line
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VIEWS FOR COMMON QUERIES
-- ============================================

-- Portfolio Summary View
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
  p.id,
  p.name,
  p.budget_total,
  COALESCE(SUM(t.total_cost), 0) AS actual_spend,
  p.budget_total - COALESCE(SUM(t.total_cost), 0) AS remaining_budget,
  CASE 
    WHEN p.budget_total > 0 THEN 
      ROUND((COALESCE(SUM(t.total_cost), 0) / p.budget_total * 100)::numeric, 2)
    ELSE 0 
  END AS budget_utilization_percent,
  COUNT(DISTINCT r.id) AS risk_count,
  COUNT(DISTINCT CASE WHEN r.status = 'Open' THEN r.id END) AS open_risks
FROM project_portfolio p
LEFT JOIN account_analytic_line t ON t.portfolio_id = p.id
LEFT JOIN project_risk r ON r.portfolio_id = p.id
GROUP BY p.id, p.name, p.budget_total;

-- Risk Matrix View
CREATE OR REPLACE VIEW risk_matrix AS
SELECT 
  probability,
  impact,
  COUNT(*) AS risk_count,
  exposure_level,
  AVG(risk_score) AS avg_score
FROM project_risk
WHERE status != 'Closed'
GROUP BY probability, impact, exposure_level;

-- Time Entry Summary by Task
CREATE OR REPLACE VIEW time_by_task AS
SELECT 
  task_id,
  COUNT(*) AS entry_count,
  SUM(hours) AS total_hours,
  SUM(total_cost) AS total_cost,
  AVG(hourly_rate) AS avg_rate,
  SUM(CASE WHEN billable THEN total_cost ELSE 0 END) AS billable_cost,
  SUM(CASE WHEN NOT billable THEN total_cost ELSE 0 END) AS non_billable_cost
FROM account_analytic_line
GROUP BY task_id;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tables created successfully!';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Helper functions created';
  RAISE NOTICE '✅ Views created';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next step: Run the ETL import script to load CSV data';
END $$;