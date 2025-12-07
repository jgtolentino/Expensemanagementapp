-- Migration: 20251207_003_agency_timesheets.sql
-- Description: Create timesheet entries and team allocations tables
-- Date: 2025-12-07

-- =============================================================================
-- 1. TIMESHEET ENTRIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.timesheet_entries (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  employee_id uuid NOT NULL,
  campaign_id uuid REFERENCES agency.campaigns(id),
  phase_id uuid REFERENCES agency.campaign_phases(id),
  
  -- Date
  entry_date date NOT NULL,
  week_start_date date NOT NULL,
  
  -- Hours
  hours numeric(5,2) NOT NULL,
  
  -- Classification
  billable boolean DEFAULT true,
  task_description text,
  task_category varchar(100),
  
  -- Rates (snapshot at time of entry)
  internal_cost_rate numeric(10,2),
  client_billing_rate numeric(10,2),
  
  -- Status
  status varchar(50) DEFAULT 'draft',
  submitted_at timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_hours CHECK (hours > 0 AND hours <= 24),
  CONSTRAINT valid_timesheet_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))
);

-- Indexes for timesheet_entries
CREATE INDEX IF NOT EXISTS idx_timesheets_employee_date ON agency.timesheet_entries(employee_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_timesheets_campaign ON agency.timesheet_entries(campaign_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_week ON agency.timesheet_entries(week_start_date, employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_tenant ON agency.timesheet_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status_submitted ON agency.timesheet_entries(status) 
  WHERE status = 'submitted';
CREATE INDEX IF NOT EXISTS idx_timesheets_billable ON agency.timesheet_entries(billable, entry_date);

-- Comments
COMMENT ON TABLE agency.timesheet_entries IS 'Time tracking entries (employee x campaign x date x hours)';
COMMENT ON COLUMN agency.timesheet_entries.week_start_date IS 'Week start date for weekly aggregation (Monday)';
COMMENT ON COLUMN agency.timesheet_entries.internal_cost_rate IS 'Employee cost rate at time of entry';
COMMENT ON COLUMN agency.timesheet_entries.client_billing_rate IS 'Rate charged to client at time of entry';

-- =============================================================================
-- 2. TEAM ALLOCATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.team_allocations (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  employee_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES agency.campaigns(id),
  phase_id uuid REFERENCES agency.campaign_phases(id),
  
  -- Period
  allocation_start_date date NOT NULL,
  allocation_end_date date NOT NULL,
  
  -- Allocation
  planned_hours numeric(10,2) NOT NULL,
  pct_of_capacity numeric(5,2),
  
  -- Role on campaign
  role_on_campaign varchar(100),
  
  -- Status
  status varchar(50) DEFAULT 'planned',
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_pct CHECK (pct_of_capacity >= 0 AND pct_of_capacity <= 100),
  CONSTRAINT valid_allocation_status CHECK (status IN ('planned', 'confirmed', 'cancelled')),
  CONSTRAINT valid_date_range CHECK (allocation_end_date >= allocation_start_date)
);

-- Indexes for team_allocations
CREATE INDEX IF NOT EXISTS idx_allocations_employee_date ON agency.team_allocations(employee_id, allocation_start_date);
CREATE INDEX IF NOT EXISTS idx_allocations_campaign ON agency.team_allocations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_allocations_tenant ON agency.team_allocations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON agency.team_allocations(status) 
  WHERE status = 'planned';

-- Comments
COMMENT ON TABLE agency.team_allocations IS 'Planned resource allocations (forward-looking)';
COMMENT ON COLUMN agency.team_allocations.pct_of_capacity IS 'Percentage of employee capacity allocated (0-100)';

-- =============================================================================
-- 3. TRIGGERS FOR UPDATED_AT
-- =============================================================================

DROP TRIGGER IF EXISTS update_timesheets_updated_at ON agency.timesheet_entries;
CREATE TRIGGER update_timesheets_updated_at
  BEFORE UPDATE ON agency.timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

DROP TRIGGER IF EXISTS update_allocations_updated_at ON agency.team_allocations;
CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON agency.team_allocations
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- =============================================================================
-- 4. AUTO-CALCULATE WEEK START DATE
-- =============================================================================

CREATE OR REPLACE FUNCTION agency.set_week_start_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set week_start_date to the Monday of the week containing entry_date
  NEW.week_start_date = date_trunc('week', NEW.entry_date)::date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_week_start_trigger ON agency.timesheet_entries;
CREATE TRIGGER set_week_start_trigger
  BEFORE INSERT OR UPDATE OF entry_date ON agency.timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION agency.set_week_start_date();

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE agency.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.team_allocations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Agency Timesheets Migration Complete';
  RAISE NOTICE 'Tables created: timesheet_entries, team_allocations';
  RAISE NOTICE 'Indexes created: 10+';
  RAISE NOTICE 'Triggers created: 3 (updated_at + auto week_start_date)';
  RAISE NOTICE 'RLS enabled on all tables';
END $$;
