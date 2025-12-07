-- =====================================================================
-- Finance PPM: CRM Schema (Lead → Opportunity Pipeline)
-- Migration: 20251207_100_ppm_crm_schema.sql
-- Description: Create CRM schema with leads, opportunities, and activities
-- Dependencies: None (core schema assumed to exist)
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create CRM schema
CREATE SCHEMA IF NOT EXISTS crm;

COMMENT ON SCHEMA crm IS 'Customer Relationship Management - Lead and opportunity pipeline';

-- =====================================================================
-- Table: crm.leads
-- Purpose: Capture leads/prospects before qualification into opportunities
-- Grain: One row per lead
-- =====================================================================

CREATE TABLE IF NOT EXISTS crm.leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Lead information
  lead_name         text NOT NULL,
  company_name      text,
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  
  -- Lead source
  source            text CHECK (source IN ('website','referral','event','cold_call','inbound','partner','other')),
  source_details    text,
  
  -- Qualification
  status            text NOT NULL CHECK (status IN ('new','contacted','qualified','disqualified','converted')) DEFAULT 'new',
  priority          text CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  
  -- Ownership
  owner_id          uuid,  -- FK to core.users (will be added when core schema ready)
  assigned_date     date,
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  converted_at      timestamptz,
  converted_to_opportunity_id uuid,
  
  -- Metadata
  notes             text,
  tags              text[]
);

-- Indexes for crm.leads
CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm.leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_owner ON crm.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm.leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created ON crm.leads(created_at DESC);

COMMENT ON TABLE crm.leads IS 'Leads/prospects before qualification into opportunities';
COMMENT ON COLUMN crm.leads.source IS 'Lead source: website, referral, event, cold_call, inbound, partner, other';
COMMENT ON COLUMN crm.leads.status IS 'Lead status: new, contacted, qualified, disqualified, converted';

-- =====================================================================
-- Table: crm.opportunities
-- Purpose: Qualified opportunities with probability, expected value, sales stages
-- Grain: One row per opportunity
-- =====================================================================

CREATE TABLE IF NOT EXISTS crm.opportunities (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  lead_id           uuid REFERENCES crm.leads(id) ON DELETE SET NULL,
  
  -- Opportunity information
  opportunity_name  text NOT NULL,
  client_name       text NOT NULL,
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  
  -- Commercial
  expected_value    numeric(12,2) NOT NULL,
  currency          text NOT NULL DEFAULT 'PHP',
  probability       numeric(5,2) CHECK (probability BETWEEN 0 AND 100) DEFAULT 50,
  weighted_value    numeric(12,2) GENERATED ALWAYS AS (expected_value * probability / 100) STORED,
  
  -- Sales stage
  stage             text NOT NULL CHECK (stage IN ('prospect','qualified','proposal','negotiation','won','lost')) DEFAULT 'prospect',
  stage_order       int GENERATED ALWAYS AS (
    CASE stage
      WHEN 'prospect' THEN 1
      WHEN 'qualified' THEN 2
      WHEN 'proposal' THEN 3
      WHEN 'negotiation' THEN 4
      WHEN 'won' THEN 5
      WHEN 'lost' THEN 6
    END
  ) STORED,
  
  -- Dates
  expected_close_date date,
  actual_close_date   date,
  
  -- Ownership
  owner_id          uuid NOT NULL,  -- FK to core.users
  
  -- Classification
  service_line      text,  -- e.g. 'Creative', 'Digital', 'Strategy'
  portfolio         text,  -- e.g. 'Consumer Tech', 'Healthcare'
  
  -- Conversion
  status            text NOT NULL CHECK (status IN ('active','won','lost')) DEFAULT 'active',
  converted_to_engagement_id uuid,  -- FK to finance_ppm.engagements (added later)
  loss_reason       text,
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  notes             text,
  tags              text[]
);

-- Indexes for crm.opportunities
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_tenant ON crm.opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON crm.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_owner ON crm.opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_status ON crm.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_close_date ON crm.opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_lead ON crm.opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_created ON crm.opportunities(created_at DESC);

COMMENT ON TABLE crm.opportunities IS 'Sales opportunities with probability, expected value, and sales stages';
COMMENT ON COLUMN crm.opportunities.stage IS 'Sales stage: prospect, qualified, proposal, negotiation, won, lost';
COMMENT ON COLUMN crm.opportunities.weighted_value IS 'Expected value × probability (auto-calculated)';
COMMENT ON COLUMN crm.opportunities.status IS 'Opportunity status: active, won, lost';

-- =====================================================================
-- Table: crm.activities
-- Purpose: Log activities related to opportunities (calls, meetings, emails)
-- Grain: One row per activity
-- =====================================================================

CREATE TABLE IF NOT EXISTS crm.activities (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  opportunity_id    uuid NOT NULL REFERENCES crm.opportunities(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type     text NOT NULL CHECK (activity_type IN ('call','meeting','email','task','note')),
  subject           text NOT NULL,
  description       text,
  
  -- Scheduling
  due_date          date,
  completed_date    date,
  status            text NOT NULL CHECK (status IN ('planned','done','cancelled')) DEFAULT 'planned',
  
  -- Ownership
  assigned_to       uuid,  -- FK to core.users
  created_by        uuid NOT NULL,  -- FK to core.users
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes for crm.activities
CREATE INDEX IF NOT EXISTS idx_crm_activities_tenant ON crm.activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opportunity ON crm.activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_assigned ON crm.activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_activities_status ON crm.activities(status);
CREATE INDEX IF NOT EXISTS idx_crm_activities_due_date ON crm.activities(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm.activities(created_at DESC);

COMMENT ON TABLE crm.activities IS 'Activities (calls, meetings, emails, tasks) related to opportunities';
COMMENT ON COLUMN crm.activities.activity_type IS 'Activity type: call, meeting, email, task, note';
COMMENT ON COLUMN crm.activities.status IS 'Activity status: planned, done, cancelled';

-- =====================================================================
-- Triggers: Auto-update updated_at timestamps
-- =====================================================================

CREATE OR REPLACE FUNCTION crm.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for crm.leads
DROP TRIGGER IF EXISTS update_crm_leads_updated_at ON crm.leads;
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON crm.leads
  FOR EACH ROW
  EXECUTE FUNCTION crm.update_updated_at_column();

-- Trigger for crm.opportunities
DROP TRIGGER IF EXISTS update_crm_opportunities_updated_at ON crm.opportunities;
CREATE TRIGGER update_crm_opportunities_updated_at
  BEFORE UPDATE ON crm.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION crm.update_updated_at_column();

-- Trigger for crm.activities
DROP TRIGGER IF EXISTS update_crm_activities_updated_at ON crm.activities;
CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON crm.activities
  FOR EACH ROW
  EXECUTE FUNCTION crm.update_updated_at_column();

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'CRM schema migration complete:';
  RAISE NOTICE '  - Schema: crm (created)';
  RAISE NOTICE '  - Tables: crm.leads, crm.opportunities, crm.activities (3 tables)';
  RAISE NOTICE '  - Indexes: 18 indexes created';
  RAISE NOTICE '  - Triggers: 3 updated_at triggers created';
  RAISE NOTICE '  - Foreign keys: lead_id → leads(id), opportunity_id → opportunities(id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_101_ppm_engagements_projects.sql';
END $$;
