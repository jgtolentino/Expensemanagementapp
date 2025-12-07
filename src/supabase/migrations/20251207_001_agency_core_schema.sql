-- Migration: 20251207_001_agency_core_schema.sql
-- Description: Create core agency schema with clients, brands, campaigns, and phases
-- Date: 2025-12-07

-- =============================================================================
-- 1. CREATE SCHEMA
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS agency;

-- =============================================================================
-- 2. CLIENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.clients (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiers
  client_code varchar(50) NOT NULL UNIQUE,
  client_name varchar(255) NOT NULL,
  client_name_short varchar(100),
  
  -- Classification
  sector varchar(100),
  industry varchar(100),
  region varchar(50),
  market_segment varchar(50),
  
  -- Business Model
  retention_type varchar(50),
  contract_start_date date,
  contract_end_date date,
  contract_value numeric(15,2),
  
  -- Contacts
  primary_contact_name varchar(255),
  primary_contact_email varchar(255),
  primary_contact_phone varchar(50),
  billing_contact_name varchar(255),
  billing_contact_email varchar(255),
  
  -- Preferences
  preferred_currency varchar(3) DEFAULT 'PHP',
  payment_terms varchar(50),
  invoicing_frequency varchar(50),
  
  -- Branding
  logo_url text,
  brand_colors jsonb,
  
  -- Rates & Overrides
  rate_override_id uuid,
  
  -- Status
  status varchar(50) DEFAULT 'active',
  churn_date date,
  churn_reason text,
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'on_hold', 'churned')),
  CONSTRAINT valid_retention CHECK (retention_type IN ('retainer', 'project', 'hybrid') OR retention_type IS NULL)
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON agency.clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_code ON agency.clients(client_code);
CREATE INDEX IF NOT EXISTS idx_clients_sector_region ON agency.clients(sector, region);
CREATE INDEX IF NOT EXISTS idx_clients_status_active ON agency.clients(status) WHERE status = 'active';

-- Comments
COMMENT ON TABLE agency.clients IS 'Master client/account list for agency workroom';
COMMENT ON COLUMN agency.clients.retention_type IS 'Retainer, Project, or Hybrid engagement model';

-- =============================================================================
-- 3. BRANDS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.brands (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  client_id uuid NOT NULL REFERENCES agency.clients(id) ON DELETE CASCADE,
  
  -- Identifiers
  brand_code varchar(50) NOT NULL UNIQUE,
  brand_name varchar(255) NOT NULL,
  brand_name_local varchar(255),
  
  -- Classification
  category varchar(100),
  sub_category varchar(100),
  target_segment varchar(100),
  
  -- Branding
  logo_url text,
  tagline varchar(500),
  brand_colors jsonb,
  
  -- Dates
  launch_date date,
  sunset_date date,
  
  -- Status
  status varchar(50) DEFAULT 'active',
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_brand_status CHECK (status IN ('active', 'inactive', 'sunset'))
);

-- Indexes for brands
CREATE INDEX IF NOT EXISTS idx_brands_client ON agency.brands(client_id);
CREATE INDEX IF NOT EXISTS idx_brands_tenant ON agency.brands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brands_status_active ON agency.brands(status) WHERE status = 'active';

-- Comments
COMMENT ON TABLE agency.brands IS 'Brands owned by clients (1 client : N brands)';

-- =============================================================================
-- 4. CAMPAIGNS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.campaigns (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  client_id uuid NOT NULL REFERENCES agency.clients(id),
  brand_id uuid REFERENCES agency.brands(id),
  
  -- Identifiers
  campaign_code varchar(50) NOT NULL UNIQUE,
  campaign_name varchar(255) NOT NULL,
  campaign_name_internal varchar(255),
  
  -- Classification
  campaign_type varchar(50) NOT NULL,
  service_line varchar(100),
  channel_mix jsonb,
  
  -- Dates & Duration
  start_date date NOT NULL,
  end_date date,
  duration_weeks integer GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_date - start_date)) / 604800
  ) STORED,
  
  -- Budget (High-Level)
  budget_currency varchar(3) DEFAULT 'PHP',
  budget_amount numeric(15,2),
  budget_id uuid,
  
  -- Status & Workflow
  status varchar(50) DEFAULT 'pipeline',
  workflow_stage varchar(50),
  approval_status varchar(50),
  approved_by uuid,
  approved_at timestamptz,
  
  -- Team
  account_director_id uuid,
  project_manager_id uuid,
  creative_director_id uuid,
  
  -- Deliverables
  deliverables_summary jsonb,
  
  -- Integration Points
  procure_quote_id uuid,
  finance_ppm_project_id uuid,
  
  -- Metadata
  description text,
  objectives text,
  success_metrics jsonb,
  tags text[],
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_campaign_type CHECK (campaign_type IN (
    'pitch', 'launch', 'sustain', 'activation', 'retainer', 'tactical'
  )),
  CONSTRAINT valid_campaign_status CHECK (status IN (
    'pipeline', 'planning', 'active', 'review', 'completed', 'cancelled', 'on_hold'
  ))
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON agency.campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON agency.campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON agency.campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_active ON agency.campaigns(status) 
  WHERE status IN ('active', 'planning');
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON agency.campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON agency.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_team ON agency.campaigns(
  account_director_id, project_manager_id, creative_director_id
);

-- GIN index for tags
CREATE INDEX IF NOT EXISTS idx_campaigns_tags ON agency.campaigns USING gin(tags);

-- Comments
COMMENT ON TABLE agency.campaigns IS 'Central campaign/project registry';
COMMENT ON COLUMN agency.campaigns.duration_weeks IS 'Auto-calculated from start_date and end_date';

-- =============================================================================
-- 5. CAMPAIGN PHASES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.campaign_phases (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  campaign_id uuid NOT NULL REFERENCES agency.campaigns(id) ON DELETE CASCADE,
  
  -- Identifiers
  phase_code varchar(50),
  phase_name varchar(255) NOT NULL,
  phase_order integer NOT NULL,
  
  -- Dates
  planned_start_date date,
  planned_end_date date,
  actual_start_date date,
  actual_end_date date,
  
  -- Effort
  planned_hours numeric(10,2),
  actual_hours numeric(10,2),
  
  -- Budget (Phase-Level)
  phase_budget_amount numeric(15,2),
  phase_actual_cost numeric(15,2),
  
  -- Status
  status varchar(50) DEFAULT 'not_started',
  completion_pct integer DEFAULT 0,
  
  -- Metadata
  description text,
  deliverables jsonb,
  
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_phase_status CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'blocked'
  )),
  CONSTRAINT valid_completion CHECK (completion_pct BETWEEN 0 AND 100)
);

-- Indexes for campaign_phases
CREATE INDEX IF NOT EXISTS idx_phases_campaign ON agency.campaign_phases(campaign_id);
CREATE INDEX IF NOT EXISTS idx_phases_tenant ON agency.campaign_phases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phases_order ON agency.campaign_phases(campaign_id, phase_order);

-- Comments
COMMENT ON TABLE agency.campaign_phases IS 'Campaign phases (Strategy, Creative, Production, Post)';

-- =============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION agency.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON agency.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON agency.clients
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- Trigger for brands
DROP TRIGGER IF EXISTS update_brands_updated_at ON agency.brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON agency.brands
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- Trigger for campaigns
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON agency.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON agency.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- Trigger for campaign_phases
DROP TRIGGER IF EXISTS update_phases_updated_at ON agency.campaign_phases;
CREATE TRIGGER update_phases_updated_at
  BEFORE UPDATE ON agency.campaign_phases
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- =============================================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE agency.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.campaign_phases ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Agency Core Schema Migration Complete';
  RAISE NOTICE 'Tables created: clients, brands, campaigns, campaign_phases';
  RAISE NOTICE 'Indexes created: 15+';
  RAISE NOTICE 'Triggers created: 4 (updated_at)';
  RAISE NOTICE 'RLS enabled on all tables';
END $$;
