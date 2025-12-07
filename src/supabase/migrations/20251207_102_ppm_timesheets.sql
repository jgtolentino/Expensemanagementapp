-- =====================================================================
-- Finance PPM: Timesheets Schema
-- Migration: 20251207_102_ppm_timesheets.sql
-- Description: Create timesheet entries for billable time tracking
-- Dependencies: 20251207_101_ppm_engagements_projects.sql
-- =====================================================================

-- =====================================================================
-- Table: finance_ppm.timesheet_entries
-- Purpose: Track billable time per employee, project, task, and date
-- Grain: One row per employee per project per task per date
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.timesheet_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Employee
  employee_id       uuid NOT NULL,  -- FK to core.users
  
  -- Project & task
  project_id        uuid NOT NULL REFERENCES finance_ppm.projects(id) ON DELETE CASCADE,
  task_id           uuid REFERENCES finance_ppm.tasks(id) ON DELETE SET NULL,
  
  -- Date tracking
  entry_date        date NOT NULL,
  week_start_date   date NOT NULL,  -- Monday of week (for grouping)
  
  -- Hours
  hours             numeric(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  
  -- Billability
  billable          boolean NOT NULL DEFAULT true,
  
  -- Rates (from rate cards or manual override)
  cost_rate         numeric(10,2),  -- Internal cost rate (₱/hr)
  bill_rate         numeric(10,2),  -- Client billing rate (₱/hr)
  
  -- Amounts (calculated from hours × rates)
  cost_amount       numeric(10,2) GENERATED ALWAYS AS (hours * COALESCE(cost_rate, 0)) STORED,
  bill_amount       numeric(10,2) GENERATED ALWAYS AS (hours * COALESCE(bill_rate, 0)) STORED,
  
  -- Approval workflow
  status            text NOT NULL CHECK (status IN ('draft','submitted','approved','rejected')) DEFAULT 'draft',
  submitted_at      timestamptz,
  approved_by       uuid,  -- FK to core.users
  approved_at       timestamptz,
  rejection_reason  text,
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  notes             text,
  
  UNIQUE(employee_id, project_id, task_id, entry_date)
);

-- Indexes for finance_ppm.timesheet_entries
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_tenant ON finance_ppm.timesheet_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_employee ON finance_ppm.timesheet_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_project ON finance_ppm.timesheet_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_task ON finance_ppm.timesheet_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_date ON finance_ppm.timesheet_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_week ON finance_ppm.timesheet_entries(week_start_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_status ON finance_ppm.timesheet_entries(status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_billable ON finance_ppm.timesheet_entries(billable);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_employee_week ON finance_ppm.timesheet_entries(employee_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_timesheet_entries_project_date ON finance_ppm.timesheet_entries(project_id, entry_date);

COMMENT ON TABLE finance_ppm.timesheet_entries IS 'Timesheet entries (billable time tracking per employee, project, task, date)';
COMMENT ON COLUMN finance_ppm.timesheet_entries.week_start_date IS 'Monday of the week (for weekly grouping and approval)';
COMMENT ON COLUMN finance_ppm.timesheet_entries.cost_rate IS 'Internal cost rate per hour (masked for non-finance roles)';
COMMENT ON COLUMN finance_ppm.timesheet_entries.bill_rate IS 'Client billing rate per hour (masked for non-finance roles)';
COMMENT ON COLUMN finance_ppm.timesheet_entries.cost_amount IS 'Auto-calculated: hours × cost_rate';
COMMENT ON COLUMN finance_ppm.timesheet_entries.bill_amount IS 'Auto-calculated: hours × bill_rate (used for WIP calculation)';
COMMENT ON COLUMN finance_ppm.timesheet_entries.status IS 'Approval status: draft, submitted, approved, rejected';

-- =====================================================================
-- Trigger: Auto-calculate week_start_date (Monday of week)
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.set_week_start_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate Monday of the week for entry_date
  NEW.week_start_date := DATE_TRUNC('week', NEW.entry_date)::date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timesheet_entry_week_start_date ON finance_ppm.timesheet_entries;
CREATE TRIGGER set_timesheet_entry_week_start_date
  BEFORE INSERT OR UPDATE OF entry_date ON finance_ppm.timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.set_week_start_date();

-- =====================================================================
-- Trigger: Auto-update updated_at
-- =====================================================================

DROP TRIGGER IF EXISTS update_finance_ppm_timesheet_entries_updated_at ON finance_ppm.timesheet_entries;
CREATE TRIGGER update_finance_ppm_timesheet_entries_updated_at
  BEFORE UPDATE ON finance_ppm.timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- =====================================================================
-- Trigger: Auto-update task actual_hours when timesheet is approved
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.update_task_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- When timesheet is approved, update task.actual_hours
  IF NEW.status = 'approved' AND NEW.task_id IS NOT NULL THEN
    UPDATE finance_ppm.tasks
    SET actual_hours = (
      SELECT COALESCE(SUM(hours), 0)
      FROM finance_ppm.timesheet_entries
      WHERE task_id = NEW.task_id
        AND status = 'approved'
    )
    WHERE id = NEW.task_id;
  END IF;
  
  -- When timesheet is rejected or deleted, recalculate
  IF (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' AND NEW.task_id IS NOT NULL) 
     OR (TG_OP = 'DELETE' AND OLD.status = 'approved' AND OLD.task_id IS NOT NULL) THEN
    UPDATE finance_ppm.tasks
    SET actual_hours = (
      SELECT COALESCE(SUM(hours), 0)
      FROM finance_ppm.timesheet_entries
      WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)
        AND status = 'approved'
    )
    WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_task_actual_hours_on_timesheet_change ON finance_ppm.timesheet_entries;
CREATE TRIGGER update_task_actual_hours_on_timesheet_change
  AFTER INSERT OR UPDATE OR DELETE ON finance_ppm.timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_task_actual_hours();

-- =====================================================================
-- Helper Function: Get employee billing rate from Procure rate cards
-- (This is a placeholder - actual implementation depends on Procure schema)
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.get_employee_billing_rate(
  p_employee_id uuid,
  p_project_id uuid,
  p_entry_date date
) RETURNS numeric AS $$
DECLARE
  v_bill_rate numeric;
BEGIN
  -- TODO: Implement rate card lookup from Procure app
  -- For now, return a default rate (this will be replaced with actual Procure integration)
  
  -- Placeholder: Return 2500 PHP/hr as default
  v_bill_rate := 2500.00;
  
  RETURN v_bill_rate;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION finance_ppm.get_employee_billing_rate IS 'Get employee billing rate from Procure rate cards (placeholder for integration)';

-- =====================================================================
-- Helper Function: Calculate WIP for project (unbilled timesheets)
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.calculate_project_time_wip(
  p_project_id uuid,
  p_as_of_date date DEFAULT CURRENT_DATE
) RETURNS numeric AS $$
DECLARE
  v_time_wip numeric;
BEGIN
  -- Calculate unbilled time WIP
  -- Sum of bill_amount for approved, billable timesheets not yet invoiced
  SELECT COALESCE(SUM(ts.bill_amount), 0) INTO v_time_wip
  FROM finance_ppm.timesheet_entries ts
  WHERE ts.project_id = p_project_id
    AND ts.status = 'approved'
    AND ts.billable = true
    AND ts.entry_date <= p_as_of_date
    AND NOT EXISTS (
      SELECT 1 
      FROM finance_ppm.invoice_lines il
      WHERE il.timesheet_entry_id = ts.id
    );
  
  RETURN v_time_wip;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION finance_ppm.calculate_project_time_wip IS 'Calculate unbilled time WIP for a project (used in WIP calculation)';

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM Timesheets migration complete:';
  RAISE NOTICE '  - Table: finance_ppm.timesheet_entries (1 table)';
  RAISE NOTICE '  - Indexes: 10 indexes created';
  RAISE NOTICE '  - Triggers:';
  RAISE NOTICE '    • set_week_start_date (auto-calculate Monday of week)';
  RAISE NOTICE '    • update_updated_at (auto-update timestamp)';
  RAISE NOTICE '    • update_task_actual_hours (sync task.actual_hours with approved timesheets)';
  RAISE NOTICE '  - Generated columns: cost_amount, bill_amount';
  RAISE NOTICE '  - Helper functions: get_employee_billing_rate, calculate_project_time_wip';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_103_ppm_invoicing.sql';
END $$;
