# Agency Creative Workroom - Data Model

**Phase:** 2 - Canonical Data Model, Knowledge Graph & RAG Design  
**Date:** 2025-12-07

---

## Overview

This document defines the complete database schema for the Agency Creative Workroom, including:
- **Core agency tables** (clients, campaigns, artifacts, timesheets)
- **Integration points** with Procure, Finance PPM, T&E, Gearroom
- **RAG/AI schema** for embeddings and assistant
- **Views and analytics** for dashboards
- **RLS policies** for role-based visibility

**Design Principles:**
1. **Normalize where appropriate**, denormalize for performance
2. **Reuse existing schemas** (Procure for rates, Finance PPM for financials)
3. **AI-first**: Every major entity embeddable for RAG
4. **Audit trail**: Track who, when, what for compliance
5. **Multi-tenant**: Tenant isolation via RLS

---

## Schema Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    AGENCY WORKROOM                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐ │
│  │   CLIENTS    │   │  CAMPAIGNS   │   │ ARTIFACTS  │ │
│  │  & BRANDS    │   │  & PHASES    │   │ & VERSIONS │ │
│  └──────┬───────┘   └──────┬───────┘   └─────┬──────┘ │
│         │                  │                   │        │
│         └──────────────────┼───────────────────┘        │
│                            │                            │
│  ┌──────────────┐   ┌──────┴───────┐   ┌────────────┐ │
│  │ TIMESHEETS   │   │    BUDGET    │   │    TEAM    │ │
│  │ & CAPACITY   │   │  & PHASES    │   │ ALLOCATION │ │
│  └──────────────┘   └──────────────┘   └────────────┘ │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                   INTEGRATION LAYER                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Procure          Finance PPM        T&E        Gearroom│
│  (Rates)          (Financials)       (Expenses) (Assets)│
│                                                          │
├─────────────────────────────────────────────────────────┤
│                      AI / RAG LAYER                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Knowledge Docs   Embeddings   Conversations   Insights │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Schema 1: Core Agency Tables

### Table: `agency.clients`

**Purpose:** Master client/account list

```sql
CREATE TABLE agency.clients (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiers
  client_code varchar(50) NOT NULL UNIQUE,  -- e.g., "ACME-001"
  client_name varchar(255) NOT NULL,
  client_name_short varchar(100),            -- e.g., "Acme" vs "Acme Corporation"
  
  -- Classification
  sector varchar(100),                       -- FMCG, Finance, Telco, Tech, Healthcare, NGO
  industry varchar(100),                     -- More specific: Beverages, Banking, Mobile, SaaS
  region varchar(50),                        -- PH, SEA, APAC, Global
  market_segment varchar(50),                -- Enterprise, SMB, Startup
  
  -- Business Model
  retention_type varchar(50),                -- Retainer, Project, Hybrid
  contract_start_date date,
  contract_end_date date,
  contract_value numeric(15,2),              -- Total contract value
  
  -- Contacts
  primary_contact_name varchar(255),
  primary_contact_email varchar(255),
  primary_contact_phone varchar(50),
  billing_contact_name varchar(255),
  billing_contact_email varchar(255),
  
  -- Preferences
  preferred_currency varchar(3) DEFAULT 'PHP',
  payment_terms varchar(50),                 -- Net 30, Net 45, Net 60
  invoicing_frequency varchar(50),           -- Monthly, Quarterly, Milestone
  
  -- Branding
  logo_url text,
  brand_colors jsonb,                        -- { primary: "#hex", secondary: "#hex" }
  
  -- Rates & Overrides
  rate_override_id uuid,                     -- FK to procure.client_rate_overrides (if exists)
  
  -- Status
  status varchar(50) DEFAULT 'active',       -- active, inactive, on_hold, churned
  churn_date date,
  churn_reason text,
  
  -- Metadata
  tenant_id uuid NOT NULL,                   -- For multi-tenancy
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'on_hold', 'churned')),
  CONSTRAINT valid_retention CHECK (retention_type IN ('retainer', 'project', 'hybrid'))
);

-- Indexes
CREATE INDEX idx_clients_tenant ON agency.clients(tenant_id);
CREATE INDEX idx_clients_code ON agency.clients(client_code);
CREATE INDEX idx_clients_sector_region ON agency.clients(sector, region);
CREATE INDEX idx_clients_status ON agency.clients(status) WHERE status = 'active';

-- RLS
ALTER TABLE agency.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_tenant_isolation ON agency.clients
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.brands`

**Purpose:** Brands owned by clients (1 client : N brands)

```sql
CREATE TABLE agency.brands (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  client_id uuid NOT NULL REFERENCES agency.clients(id) ON DELETE CASCADE,
  
  -- Identifiers
  brand_code varchar(50) NOT NULL UNIQUE,    -- e.g., "ACME-BRX"
  brand_name varchar(255) NOT NULL,
  brand_name_local varchar(255),             -- Localized name
  
  -- Classification
  category varchar(100),                     -- Product category
  sub_category varchar(100),
  target_segment varchar(100),               -- Mass, Premium, Luxury
  
  -- Branding
  logo_url text,
  tagline varchar(500),
  brand_colors jsonb,
  
  -- Dates
  launch_date date,
  sunset_date date,
  
  -- Status
  status varchar(50) DEFAULT 'active',       -- active, inactive, sunset
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_brands_client ON agency.brands(client_id);
CREATE INDEX idx_brands_status ON agency.brands(status) WHERE status = 'active';

-- RLS
ALTER TABLE agency.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY brands_tenant_isolation ON agency.brands
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.campaigns`

**Purpose:** Central campaign/project registry

```sql
CREATE TABLE agency.campaigns (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  client_id uuid NOT NULL REFERENCES agency.clients(id),
  brand_id uuid REFERENCES agency.brands(id),           -- Nullable for multi-brand campaigns
  
  -- Identifiers
  campaign_code varchar(50) NOT NULL UNIQUE,            -- e.g., "ACME-BRX-Q1-2025"
  campaign_name varchar(255) NOT NULL,
  campaign_name_internal varchar(255),                  -- Internal codename
  
  -- Classification
  campaign_type varchar(50) NOT NULL,                   -- pitch, launch, sustain, activation, retainer, tactical
  service_line varchar(100),                            -- Strategy, Creative, Production, Digital, Media, Social
  channel_mix jsonb,                                    -- ["TVC", "Digital", "Print", "OOH", "Social"]
  
  -- Dates & Duration
  start_date date NOT NULL,
  end_date date,
  duration_weeks integer GENERATED ALWAYS AS (
    EXTRACT(WEEK FROM age(end_date, start_date))
  ) STORED,
  
  -- Budget (High-Level)
  budget_currency varchar(3) DEFAULT 'PHP',
  budget_amount numeric(15,2),                          -- Total budget
  budget_id uuid,                                       -- FK to procure.project_quotes (detailed budget)
  
  -- Status & Workflow
  status varchar(50) DEFAULT 'pipeline',                -- pipeline, planning, active, review, completed, cancelled, on_hold
  workflow_stage varchar(50),                           -- brief, concept, pitch, production, delivery, post-campaign
  approval_status varchar(50),                          -- pending, approved, rejected
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Team
  account_director_id uuid REFERENCES auth.users(id),
  project_manager_id uuid REFERENCES auth.users(id),
  creative_director_id uuid REFERENCES auth.users(id),
  
  -- Deliverables
  deliverables_summary jsonb,                           -- [{ type: "TVC", quantity: 3, format: "30s" }]
  
  -- Integration Points
  procure_quote_id uuid,                                -- Link to Procure quote
  finance_ppm_project_id uuid,                          -- Link to Finance PPM project
  
  -- Metadata
  description text,
  objectives text,
  success_metrics jsonb,                                -- KPIs, benchmarks
  tags text[],
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_campaign_type CHECK (campaign_type IN (
    'pitch', 'launch', 'sustain', 'activation', 'retainer', 'tactical'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'pipeline', 'planning', 'active', 'review', 'completed', 'cancelled', 'on_hold'
  ))
);

-- Indexes
CREATE INDEX idx_campaigns_client ON agency.campaigns(client_id);
CREATE INDEX idx_campaigns_brand ON agency.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON agency.campaigns(status) WHERE status IN ('active', 'planning');
CREATE INDEX idx_campaigns_type ON agency.campaigns(campaign_type);
CREATE INDEX idx_campaigns_dates ON agency.campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_team ON agency.campaigns(account_director_id, project_manager_id, creative_director_id);

-- RLS
ALTER TABLE agency.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY campaigns_tenant_isolation ON agency.campaigns
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.campaign_phases`

**Purpose:** Break campaigns into phases (Strategy, Creative, Production, Post)

```sql
CREATE TABLE agency.campaign_phases (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  campaign_id uuid NOT NULL REFERENCES agency.campaigns(id) ON DELETE CASCADE,
  
  -- Identifiers
  phase_code varchar(50),                               -- e.g., "STRATEGY", "CREATIVE"
  phase_name varchar(255) NOT NULL,
  phase_order integer NOT NULL,                         -- 1, 2, 3, 4
  
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
  status varchar(50) DEFAULT 'not_started',             -- not_started, in_progress, completed, blocked
  completion_pct integer DEFAULT 0,
  
  -- Metadata
  description text,
  deliverables jsonb,                                   -- Phase-specific deliverables
  
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_phase_status CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'blocked'
  )),
  CONSTRAINT valid_completion CHECK (completion_pct BETWEEN 0 AND 100)
);

-- Indexes
CREATE INDEX idx_phases_campaign ON agency.campaign_phases(campaign_id);
CREATE INDEX idx_phases_order ON agency.campaign_phases(campaign_id, phase_order);

-- RLS
ALTER TABLE agency.campaign_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY phases_tenant_isolation ON agency.campaign_phases
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.artifacts`

**Purpose:** Creative work artifacts (briefs, scripts, decks, boards, concepts)

```sql
CREATE TABLE agency.artifacts (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  campaign_id uuid REFERENCES agency.campaigns(id),
  client_id uuid REFERENCES agency.clients(id),
  brand_id uuid REFERENCES agency.brands(id),
  phase_id uuid REFERENCES agency.campaign_phases(id),
  
  -- Identifiers
  artifact_code varchar(50) UNIQUE,                     -- e.g., "ACME-BRIEF-001"
  title varchar(500) NOT NULL,
  
  -- Type
  artifact_type varchar(50) NOT NULL,                   -- brief, script, deck, board, concept, storyboard, layout, key_visual
  sub_type varchar(50),                                 -- e.g., TVC_30s, Print_A4, Digital_Banner
  format varchar(50),                                   -- pdf, pptx, docx, figma, sketch, video, image
  
  -- Content
  content text,                                         -- For text-based artifacts (Markdown/HTML)
  content_url text,                                     -- For files (Supabase Storage URL)
  content_preview text,                                 -- First 500 chars for search
  file_size_bytes bigint,
  mime_type varchar(100),
  
  -- Metadata
  description text,
  tags text[],
  icon varchar(50),                                     -- Emoji or icon name
  
  -- Ownership & Workflow
  owner_id uuid REFERENCES auth.users(id),
  status varchar(50) DEFAULT 'draft',                   -- draft, review, approved, published, archived
  version integer DEFAULT 1,
  parent_artifact_id uuid REFERENCES agency.artifacts(id), -- For versioning
  
  -- Approval
  approver_id uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  approval_notes text,
  
  -- Analytics
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  
  -- AI/RAG
  embedding_status varchar(50) DEFAULT 'pending',       -- pending, in_progress, completed, failed
  embedded_at timestamptz,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_artifact_type CHECK (artifact_type IN (
    'brief', 'script', 'deck', 'board', 'concept', 'storyboard', 'layout', 'key_visual', 'other'
  )),
  CONSTRAINT valid_artifact_status CHECK (status IN (
    'draft', 'review', 'approved', 'published', 'archived'
  ))
);

-- Indexes
CREATE INDEX idx_artifacts_campaign ON agency.artifacts(campaign_id);
CREATE INDEX idx_artifacts_client ON agency.artifacts(client_id);
CREATE INDEX idx_artifacts_type ON agency.artifacts(artifact_type);
CREATE INDEX idx_artifacts_status ON agency.artifacts(status);
CREATE INDEX idx_artifacts_owner ON agency.artifacts(owner_id);
CREATE INDEX idx_artifacts_tags ON agency.artifacts USING gin(tags);
CREATE INDEX idx_artifacts_embedding_status ON agency.artifacts(embedding_status) WHERE embedding_status = 'pending';

-- Full-text search
CREATE INDEX idx_artifacts_content_search ON agency.artifacts USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_preview, ''))
);

-- RLS
ALTER TABLE agency.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY artifacts_tenant_isolation ON agency.artifacts
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.artifact_versions`

**Purpose:** Version history for artifacts

```sql
CREATE TABLE agency.artifact_versions (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  artifact_id uuid NOT NULL REFERENCES agency.artifacts(id) ON DELETE CASCADE,
  
  -- Version Info
  version_number integer NOT NULL,
  
  -- Snapshot
  title varchar(500),
  content text,
  content_url text,
  tags text[],
  status varchar(50),
  
  -- Change Tracking
  changed_by uuid REFERENCES auth.users(id),
  change_summary text,                                  -- What changed
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_artifact_version UNIQUE (artifact_id, version_number)
);

-- Indexes
CREATE INDEX idx_versions_artifact ON agency.artifact_versions(artifact_id, version_number DESC);

-- RLS
ALTER TABLE agency.artifact_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY versions_tenant_isolation ON agency.artifact_versions
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.artifact_comments`

**Purpose:** Threaded comments on artifacts

```sql
CREATE TABLE agency.artifact_comments (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  artifact_id uuid NOT NULL REFERENCES agency.artifacts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES agency.artifact_comments(id), -- For threading
  
  -- Content
  comment_text text NOT NULL,
  
  -- Metadata
  commenter_id uuid NOT NULL REFERENCES auth.users(id),
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_comments_artifact ON agency.artifact_comments(artifact_id, created_at DESC);
CREATE INDEX idx_comments_parent ON agency.artifact_comments(parent_comment_id);

-- RLS
ALTER TABLE agency.artifact_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_tenant_isolation ON agency.artifact_comments
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Schema 2: Timesheets & Capacity

### Table: `agency.timesheet_entries`

**Purpose:** Timesheet rows (employee x campaign x date x hours)

```sql
CREATE TABLE agency.timesheet_entries (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  employee_id uuid NOT NULL REFERENCES auth.users(id),
  campaign_id uuid REFERENCES agency.campaigns(id),
  phase_id uuid REFERENCES agency.campaign_phases(id),
  
  -- Date
  entry_date date NOT NULL,
  week_start_date date NOT NULL,                        -- For weekly aggregation
  
  -- Hours
  hours numeric(5,2) NOT NULL,                          -- 8.00, 4.50
  
  -- Classification
  billable boolean DEFAULT true,
  task_description text,
  task_category varchar(100),                           -- Meeting, Creative, Admin, etc.
  
  -- Rates (snapshot at time of entry)
  internal_cost_rate numeric(10,2),                     -- Employee's cost rate
  client_billing_rate numeric(10,2),                    -- Rate charged to client
  
  -- Status
  status varchar(50) DEFAULT 'draft',                   -- draft, submitted, approved, rejected
  submitted_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_hours CHECK (hours > 0 AND hours <= 24),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))
);

-- Indexes
CREATE INDEX idx_timesheets_employee_date ON agency.timesheet_entries(employee_id, entry_date DESC);
CREATE INDEX idx_timesheets_campaign ON agency.timesheet_entries(campaign_id, entry_date);
CREATE INDEX idx_timesheets_week ON agency.timesheet_entries(week_start_date, employee_id);
CREATE INDEX idx_timesheets_status ON agency.timesheet_entries(status) WHERE status = 'submitted';

-- RLS
ALTER TABLE agency.timesheet_entries ENABLE ROW LEVEL SECURITY;

-- Employees can see their own entries
CREATE POLICY timesheets_own_entries ON agency.timesheet_entries
  FOR ALL USING (
    employee_id = auth.uid()
    OR
    current_setting('app.current_role') IN ('finance', 'leadership')
  );
```

---

### Table: `agency.team_allocations`

**Purpose:** Planned resource allocations (forward-looking)

```sql
CREATE TABLE agency.team_allocations (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  employee_id uuid NOT NULL REFERENCES auth.users(id),
  campaign_id uuid NOT NULL REFERENCES agency.campaigns(id),
  phase_id uuid REFERENCES agency.campaign_phases(id),
  
  -- Period
  allocation_start_date date NOT NULL,
  allocation_end_date date NOT NULL,
  
  -- Allocation
  planned_hours numeric(10,2) NOT NULL,                 -- Total hours for period
  pct_of_capacity numeric(5,2),                         -- % of employee's capacity (0-100)
  
  -- Role on campaign
  role_on_campaign varchar(100),                        -- Creative Director, Copywriter, etc.
  
  -- Status
  status varchar(50) DEFAULT 'planned',                 -- planned, confirmed, cancelled
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_pct CHECK (pct_of_capacity >= 0 AND pct_of_capacity <= 100)
);

-- Indexes
CREATE INDEX idx_allocations_employee_date ON agency.team_allocations(employee_id, allocation_start_date);
CREATE INDEX idx_allocations_campaign ON agency.team_allocations(campaign_id);

-- RLS
ALTER TABLE agency.team_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY allocations_tenant_isolation ON agency.team_allocations
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Schema 3: Integration with Existing Systems

### Integration 1: Procure (Rate Cards & Budgets)

**Reuse Existing Tables:**
- `procure.rate_cards` - Core rate cards
- `procure.vendors` - Vendor/consultant master
- `procure.project_quotes` - Campaign budgets
- `procure.quote_lines` - Budget line items

**New Integration Table:**

```sql
-- Link campaigns to Procure quotes
ALTER TABLE agency.campaigns 
  ADD COLUMN procure_quote_id uuid REFERENCES procure.project_quotes(id);

CREATE INDEX idx_campaigns_procure_quote ON agency.campaigns(procure_quote_id);

-- View: Rate cards for agency users (RLS-protected)
CREATE VIEW agency.v_rate_cards AS
SELECT 
  rc.id,
  rc.role_name,
  rc.discipline,
  rc.seniority_level,
  rc.market,
  rc.unit_of_measure,
  rc.client_rate,
  rc.currency,
  -- Finance-only fields (filtered by RLS at runtime)
  CASE 
    WHEN current_setting('app.current_role') IN ('finance', 'leadership') 
    THEN rc.cost_rate 
    ELSE NULL 
  END AS cost_rate,
  CASE 
    WHEN current_setting('app.current_role') IN ('finance', 'leadership') 
    THEN rc.vendor_id 
    ELSE NULL 
  END AS vendor_id,
  CASE 
    WHEN current_setting('app.current_role') IN ('finance', 'leadership') 
    THEN rc.margin_pct 
    ELSE NULL 
  END AS margin_pct
FROM procure.rate_cards rc
WHERE rc.state = 'active';
```

---

### Integration 2: Finance PPM (Project Financials)

**Reuse Existing Tables:**
- `finance_ppm.projects` - Project master
- `finance_ppm.project_financials` - Monthly P&L snapshots

**New Integration Table:**

```sql
-- Link campaigns to Finance PPM projects
ALTER TABLE finance_ppm.projects 
  ADD COLUMN agency_campaign_id uuid REFERENCES agency.campaigns(id);

CREATE INDEX idx_ppm_projects_campaign ON finance_ppm.projects(agency_campaign_id);

-- View: Campaign financials (aggregated from Finance PPM)
CREATE VIEW agency.v_campaign_financials AS
SELECT 
  c.id AS campaign_id,
  c.campaign_code,
  c.campaign_name,
  c.client_id,
  p.id AS finance_ppm_project_id,
  pf.period_month,
  pf.budget_amount,
  pf.actual_cost,
  pf.revenue,
  pf.margin_pct,
  pf.wip_amount,
  pf.ar_amount,
  CASE 
    WHEN pf.margin_pct < 15 THEN 'critical'
    WHEN pf.margin_pct < 20 THEN 'warning'
    ELSE 'healthy'
  END AS margin_health
FROM agency.campaigns c
LEFT JOIN finance_ppm.projects p ON p.agency_campaign_id = c.id
LEFT JOIN finance_ppm.project_financials pf ON pf.project_id = p.id;
```

---

### Integration 3: T&E (Expenses)

**Reuse Existing Tables:**
- `te.expense_reports` - Expense reports
- `te.expense_lines` - Individual expenses

**New Integration Column:**

```sql
-- Link expenses to campaigns
ALTER TABLE te.expense_lines 
  ADD COLUMN agency_campaign_id uuid REFERENCES agency.campaigns(id);

CREATE INDEX idx_expense_lines_campaign ON te.expense_lines(agency_campaign_id);

-- Function: Aggregate campaign expenses
CREATE FUNCTION agency.get_campaign_expenses(p_campaign_id uuid)
RETURNS TABLE (
  total_expenses numeric,
  expense_count bigint,
  categories jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(el.amount), 0) AS total_expenses,
    COUNT(*) AS expense_count,
    jsonb_object_agg(el.category, SUM(el.amount)) AS categories
  FROM te.expense_lines el
  WHERE el.agency_campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### Integration 4: Gearroom (Equipment Checkouts)

**Reuse Existing Tables:**
- `gear.items` - Equipment catalog
- `gear.checkouts` - Checkout records

**New Integration Column:**

```sql
-- Link checkouts to campaigns
ALTER TABLE gear.checkouts 
  ADD COLUMN agency_campaign_id uuid REFERENCES agency.campaigns(id);

CREATE INDEX idx_checkouts_campaign ON gear.checkouts(agency_campaign_id);

-- View: Equipment used per campaign
CREATE VIEW agency.v_campaign_equipment AS
SELECT 
  c.id AS campaign_id,
  c.campaign_code,
  i.item_name,
  i.category,
  co.checkout_date,
  co.return_date,
  co.checked_out_by,
  co.purpose
FROM agency.campaigns c
JOIN gear.checkouts co ON co.agency_campaign_id = c.id
JOIN gear.items i ON i.id = co.item_id;
```

---

## Schema 4: AI / RAG Layer

### Table: `agency.knowledge_documents`

**Purpose:** Agency-specific knowledge base (extends `gold.docs` pattern)

```sql
CREATE TABLE agency.knowledge_documents (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type & Source
  doc_type varchar(50) NOT NULL,                        -- playbook, template, policy, sop, guide
  source varchar(50) NOT NULL,                          -- notion, local, uploaded, generated
  source_id text,                                       -- External ID (e.g., Notion page ID)
  
  -- Content
  title varchar(500) NOT NULL,
  content text NOT NULL,
  content_preview text GENERATED ALWAYS AS (
    LEFT(content, 500)
  ) STORED,
  
  -- Classification
  tags text[],
  client_id uuid REFERENCES agency.clients(id),        -- Client-specific docs
  category varchar(100),                                -- onboarding, process, best-practice
  
  -- Embedding Status
  embedding_status varchar(50) DEFAULT 'pending',
  last_synced_at timestamptz,
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_docs_type ON agency.knowledge_documents(doc_type);
CREATE INDEX idx_knowledge_docs_client ON agency.knowledge_documents(client_id);
CREATE INDEX idx_knowledge_docs_tags ON agency.knowledge_documents USING gin(tags);
CREATE INDEX idx_knowledge_docs_embedding_status ON agency.knowledge_documents(embedding_status) 
  WHERE embedding_status = 'pending';

-- RLS
ALTER TABLE agency.knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY knowledge_docs_tenant_isolation ON agency.knowledge_documents
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.knowledge_chunks`

**Purpose:** Chunked + embedded knowledge for RAG

```sql
CREATE TABLE agency.knowledge_chunks (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  document_id uuid NOT NULL REFERENCES agency.knowledge_documents(id) ON DELETE CASCADE,
  
  -- Chunk
  chunk_index integer NOT NULL,
  content text NOT NULL,
  
  -- Embedding (1536-dim for OpenAI ada-002)
  embedding vector(1536),
  
  -- Metadata
  metadata jsonb,                                       -- { heading: "...", section: "..." }
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_document_chunk UNIQUE (document_id, chunk_index)
);

-- Indexes
CREATE INDEX idx_knowledge_chunks_document ON agency.knowledge_chunks(document_id);

-- Vector index (HNSW for < 1M rows, IVFFlat for > 1M)
CREATE INDEX idx_knowledge_chunks_embedding ON agency.knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops);

-- RLS
ALTER TABLE agency.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY knowledge_chunks_tenant_isolation ON agency.knowledge_chunks
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

### Table: `agency.ai_conversations`

**Purpose:** AI assistant chat sessions

```sql
CREATE TABLE agency.ai_conversations (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id uuid NOT NULL REFERENCES auth.users(id),
  user_role varchar(50),                                -- Snapshot of role at conversation time
  
  -- Context
  context_type varchar(50),                             -- campaign, artifact, client, dashboard
  context_id uuid,                                      -- ID of the entity
  
  -- Metadata
  conversation_title varchar(500),
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_conversations_user ON agency.ai_conversations(user_id, created_at DESC);
CREATE INDEX idx_ai_conversations_context ON agency.ai_conversations(context_type, context_id);

-- RLS
ALTER TABLE agency.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_conversations_own ON agency.ai_conversations
  FOR ALL USING (user_id = auth.uid());
```

---

### Table: `agency.ai_messages`

**Purpose:** Individual messages in AI conversations

```sql
CREATE TABLE agency.ai_messages (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  conversation_id uuid NOT NULL REFERENCES agency.ai_conversations(id) ON DELETE CASCADE,
  
  -- Message
  role varchar(50) NOT NULL,                            -- user, assistant, system
  content text NOT NULL,
  
  -- Sources (for RAG citations)
  sources jsonb,                                        -- [{ type: "artifact", id: "...", title: "..." }]
  
  -- Metadata
  model varchar(100),                                   -- gpt-4o, claude-3-5-sonnet
  tokens_used integer,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- Indexes
CREATE INDEX idx_ai_messages_conversation ON agency.ai_messages(conversation_id, created_at);

-- RLS
ALTER TABLE agency.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_messages_via_conversation ON agency.ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency.ai_conversations c
      WHERE c.id = ai_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );
```

---

## Schema 5: Analytics Views

### View: `agency.v_dashboard_kpis`

**Purpose:** Home dashboard KPI tiles

```sql
CREATE VIEW agency.v_dashboard_kpis AS
WITH current_month AS (
  SELECT DATE_TRUNC('month', CURRENT_DATE) AS month_start
)
SELECT 
  -- Active Clients
  COUNT(DISTINCT cl.id) FILTER (WHERE cl.status = 'active') AS active_clients,
  
  -- Campaign Revenue (YTD)
  COALESCE(SUM(cf.revenue), 0) AS campaign_revenue_ytd,
  
  -- Monthly Margin (Current Month)
  AVG(cf.margin_pct) FILTER (
    WHERE cf.period_month = (SELECT month_start FROM current_month)
  ) AS monthly_margin_pct,
  
  -- Team Utilization (Current Week)
  (
    SELECT AVG(
      (SUM(te.hours) FILTER (WHERE te.billable = true) / NULLIF(SUM(te.hours), 0)) * 100
    )
    FROM agency.timesheet_entries te
    WHERE te.week_start_date = DATE_TRUNC('week', CURRENT_DATE)
  ) AS team_utilization_pct,
  
  -- Top Client (by YTD revenue)
  (
    SELECT cl2.client_name
    FROM agency.clients cl2
    JOIN agency.campaigns c2 ON c2.client_id = cl2.id
    JOIN agency.v_campaign_financials cf2 ON cf2.campaign_id = c2.id
    GROUP BY cl2.id, cl2.client_name
    ORDER BY SUM(cf2.revenue) DESC NULLS LAST
    LIMIT 1
  ) AS top_client_name,
  
  (
    SELECT SUM(cf2.revenue)
    FROM agency.clients cl2
    JOIN agency.campaigns c2 ON c2.client_id = cl2.id
    JOIN agency.v_campaign_financials cf2 ON cf2.campaign_id = c2.id
    WHERE cl2.client_name = (
      SELECT cl3.client_name
      FROM agency.clients cl3
      JOIN agency.campaigns c3 ON c3.client_id = cl3.id
      JOIN agency.v_campaign_financials cf3 ON cf3.campaign_id = c3.id
      GROUP BY cl3.id, cl3.client_name
      ORDER BY SUM(cf3.revenue) DESC NULLS LAST
      LIMIT 1
    )
  ) AS top_client_revenue

FROM agency.clients cl
LEFT JOIN agency.campaigns c ON c.client_id = cl.id
LEFT JOIN agency.v_campaign_financials cf ON cf.campaign_id = c.id
WHERE cl.tenant_id = current_setting('app.current_tenant')::uuid;
```

---

### View: `agency.v_campaign_overview`

**Purpose:** Campaign list with key metrics

```sql
CREATE VIEW agency.v_campaign_overview AS
SELECT 
  c.id,
  c.campaign_code,
  c.campaign_name,
  c.campaign_type,
  c.status,
  c.start_date,
  c.end_date,
  
  -- Client & Brand
  cl.client_name,
  b.brand_name,
  
  -- Budget
  c.budget_amount,
  cf.actual_cost,
  cf.revenue,
  cf.margin_pct,
  
  -- Team
  ad.email AS account_director_email,
  pm.email AS project_manager_email,
  cd.email AS creative_director_email,
  
  -- Artifacts
  COUNT(DISTINCT a.id) AS artifact_count,
  
  -- Timesheets
  COALESCE(SUM(te.hours), 0) AS total_hours_logged,
  
  -- Health
  CASE 
    WHEN cf.margin_pct IS NULL THEN 'unknown'
    WHEN cf.margin_pct < 15 THEN 'critical'
    WHEN cf.margin_pct < 20 THEN 'warning'
    ELSE 'healthy'
  END AS health_status

FROM agency.campaigns c
LEFT JOIN agency.clients cl ON cl.id = c.client_id
LEFT JOIN agency.brands b ON b.id = c.brand_id
LEFT JOIN agency.v_campaign_financials cf ON cf.campaign_id = c.id
LEFT JOIN auth.users ad ON ad.id = c.account_director_id
LEFT JOIN auth.users pm ON pm.id = c.project_manager_id
LEFT JOIN auth.users cd ON cd.id = c.creative_director_id
LEFT JOIN agency.artifacts a ON a.campaign_id = c.id
LEFT JOIN agency.timesheet_entries te ON te.campaign_id = c.id

GROUP BY 
  c.id, c.campaign_code, c.campaign_name, c.campaign_type, c.status,
  c.start_date, c.end_date, c.budget_amount,
  cl.client_name, b.brand_name,
  cf.actual_cost, cf.revenue, cf.margin_pct,
  ad.email, pm.email, cd.email;
```

---

### View: `agency.v_client_360`

**Purpose:** Client 360-degree view

```sql
CREATE VIEW agency.v_client_360 AS
SELECT 
  cl.id,
  cl.client_code,
  cl.client_name,
  cl.sector,
  cl.region,
  cl.retention_type,
  cl.status,
  
  -- Brands
  COUNT(DISTINCT b.id) AS brand_count,
  
  -- Campaigns
  COUNT(DISTINCT c.id) AS total_campaigns,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') AS active_campaigns,
  
  -- Financials
  COALESCE(SUM(cf.revenue), 0) AS revenue_ytd,
  AVG(cf.margin_pct) AS avg_margin_pct,
  COALESCE(SUM(cf.wip_amount), 0) AS total_wip,
  COALESCE(SUM(cf.ar_amount), 0) AS total_ar,
  
  -- Artifacts
  COUNT(DISTINCT a.id) AS artifact_count,
  
  -- Last Activity
  MAX(c.updated_at) AS last_campaign_update

FROM agency.clients cl
LEFT JOIN agency.brands b ON b.client_id = cl.id
LEFT JOIN agency.campaigns c ON c.client_id = cl.id
LEFT JOIN agency.v_campaign_financials cf ON cf.campaign_id = c.id
LEFT JOIN agency.artifacts a ON a.client_id = cl.id

GROUP BY 
  cl.id, cl.client_code, cl.client_name, cl.sector, cl.region,
  cl.retention_type, cl.status;
```

---

### View: `agency.v_utilization_by_employee`

**Purpose:** Employee utilization metrics

```sql
CREATE VIEW agency.v_utilization_by_employee AS
WITH weekly_capacity AS (
  SELECT 40 AS standard_hours_per_week
)
SELECT 
  u.id AS employee_id,
  u.email,
  u.raw_user_meta_data->>'full_name' AS employee_name,
  u.raw_user_meta_data->>'role' AS employee_role,
  
  te.week_start_date,
  
  -- Hours
  SUM(te.hours) AS total_hours,
  SUM(te.hours) FILTER (WHERE te.billable = true) AS billable_hours,
  SUM(te.hours) FILTER (WHERE te.billable = false) AS non_billable_hours,
  
  -- Utilization
  (SUM(te.hours) / (SELECT standard_hours_per_week FROM weekly_capacity)) * 100 AS capacity_pct,
  (SUM(te.hours) FILTER (WHERE te.billable = true) / NULLIF(SUM(te.hours), 0)) * 100 AS billable_pct

FROM auth.users u
LEFT JOIN agency.timesheet_entries te ON te.employee_id = u.id

GROUP BY 
  u.id, u.email, u.raw_user_meta_data->>'full_name', 
  u.raw_user_meta_data->>'role', te.week_start_date;
```

---

## Schema 6: RLS Policies

### Policy Strategy

**Tenant Isolation (All Tables):**
```sql
-- Example for campaigns
CREATE POLICY campaigns_tenant_isolation ON agency.campaigns
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

**Role-Based Visibility:**

```sql
-- Finance-only data
CREATE POLICY campaign_financials_finance_only ON agency.v_campaign_financials
  FOR SELECT USING (
    current_setting('app.current_role') IN ('finance', 'leadership')
  );

-- Own timesheets + managers can see team
CREATE POLICY timesheets_employee_own ON agency.timesheet_entries
  FOR ALL USING (
    employee_id = auth.uid()
    OR
    current_setting('app.current_role') IN ('finance', 'leadership', 'pm')
  );

-- Artifacts: owner + campaign team + finance
CREATE POLICY artifacts_visibility ON agency.artifacts
  FOR SELECT USING (
    owner_id = auth.uid()
    OR
    campaign_id IN (
      SELECT c.id FROM agency.campaigns c
      WHERE c.account_director_id = auth.uid()
      OR c.project_manager_id = auth.uid()
      OR c.creative_director_id = auth.uid()
    )
    OR
    current_setting('app.current_role') IN ('finance', 'leadership')
  );
```

---

## Sample Data Structures

### Sample Client
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "client_code": "ACME-001",
  "client_name": "Acme Corporation",
  "client_name_short": "Acme",
  "sector": "FMCG",
  "industry": "Beverages",
  "region": "PH",
  "retention_type": "retainer",
  "contract_start_date": "2024-01-01",
  "contract_value": 50000000,
  "status": "active"
}
```

### Sample Campaign
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "campaign_code": "ACME-BRX-Q1-2025",
  "campaign_name": "Acme Brand X Q1 Launch",
  "campaign_type": "launch",
  "client_id": "550e8400-e29b-41d4-a716-446655440000",
  "brand_id": "...",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "budget_amount": 5200000,
  "status": "active",
  "channel_mix": ["TVC", "Digital", "OOH"],
  "tags": ["brand-launch", "tvc", "q1-2025"]
}
```

### Sample Artifact
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "artifact_code": "ACME-BRIEF-001",
  "title": "Acme Brand X Q1 Launch Brief",
  "artifact_type": "brief",
  "campaign_id": "660e8400-e29b-41d4-a716-446655440001",
  "content": "# Campaign Brief\n\n## Background\nAcme Corp is launching...",
  "content_preview": "# Campaign Brief\n\n## Background\nAcme Corp is launching...",
  "owner_id": "user-id-john",
  "status": "approved",
  "tags": ["brand-launch", "brief"],
  "version": 1
}
```

### Sample Timesheet Entry
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "employee_id": "user-id-sarah",
  "campaign_id": "660e8400-e29b-41d4-a716-446655440001",
  "entry_date": "2025-12-02",
  "week_start_date": "2025-12-02",
  "hours": 8.0,
  "billable": true,
  "task_description": "Creative concepting for TVC",
  "internal_cost_rate": 20000,
  "client_billing_rate": 28000,
  "status": "approved"
}
```

---

## Performance Considerations

### Indexing Strategy

**High-Cardinality Columns:**
- `client_id`, `campaign_id`, `employee_id` - Foreign keys
- `status`, `campaign_type` - Frequently filtered enums
- `created_at`, `updated_at` - Time-series queries

**Composite Indexes:**
```sql
-- Campaign list page
CREATE INDEX idx_campaigns_status_client ON agency.campaigns(status, client_id)
  WHERE status IN ('active', 'planning');

-- Timesheet queries
CREATE INDEX idx_timesheets_emp_week ON agency.timesheet_entries(employee_id, week_start_date DESC);

-- Artifact search
CREATE INDEX idx_artifacts_type_status ON agency.artifacts(artifact_type, status)
  WHERE status != 'archived';
```

**Partial Indexes:**
```sql
-- Only index active/pending records
CREATE INDEX idx_campaigns_active ON agency.campaigns(client_id, start_date)
  WHERE status IN ('active', 'planning');
```

---

### Partitioning (Future)

**Timesheet Entries (by month):**
```sql
-- For > 1M timesheet rows
CREATE TABLE agency.timesheet_entries_2025_01 
  PARTITION OF agency.timesheet_entries
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

### Materialized Views (Optional)

**For heavy aggregate queries:**
```sql
-- Campaign analytics (refresh daily)
CREATE MATERIALIZED VIEW agency.mv_campaign_analytics AS
SELECT * FROM agency.v_campaign_overview;

CREATE INDEX idx_mv_campaign_client ON agency.mv_campaign_analytics(client_name);

-- Refresh daily at 2 AM
REFRESH MATERIALIZED VIEW CONCURRENTLY agency.mv_campaign_analytics;
```

---

## Query Examples

### Query 1: Get Campaign with Team and Artifacts
```sql
SELECT 
  c.*,
  json_build_object(
    'client', cl.client_name,
    'brand', b.brand_name
  ) AS client_info,
  json_build_object(
    'account_director', ad.email,
    'project_manager', pm.email,
    'creative_director', cd.email
  ) AS team,
  (
    SELECT json_agg(json_build_object(
      'id', a.id,
      'title', a.title,
      'type', a.artifact_type,
      'status', a.status
    ))
    FROM agency.artifacts a
    WHERE a.campaign_id = c.id
  ) AS artifacts,
  cf.revenue,
  cf.margin_pct
FROM agency.campaigns c
LEFT JOIN agency.clients cl ON cl.id = c.client_id
LEFT JOIN agency.brands b ON b.id = c.brand_id
LEFT JOIN auth.users ad ON ad.id = c.account_director_id
LEFT JOIN auth.users pm ON pm.id = c.project_manager_id
LEFT JOIN auth.users cd ON cd.id = c.creative_director_id
LEFT JOIN agency.v_campaign_financials cf ON cf.campaign_id = c.id
WHERE c.id = 'campaign-id-here';
```

### Query 2: Employee Utilization (Current Month)
```sql
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' AS name,
  COALESCE(SUM(te.hours), 0) AS total_hours,
  COALESCE(SUM(te.hours) FILTER (WHERE te.billable = true), 0) AS billable_hours,
  ROUND(
    (COALESCE(SUM(te.hours), 0) / 160) * 100, 
    1
  ) AS utilization_pct
FROM auth.users u
LEFT JOIN agency.timesheet_entries te ON te.employee_id = u.id
WHERE te.entry_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND te.entry_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  AND te.status = 'approved'
GROUP BY u.id, u.email, u.raw_user_meta_data->>'full_name'
ORDER BY utilization_pct DESC;
```

### Query 3: Top Clients by Revenue (YTD)
```sql
SELECT 
  cl.client_code,
  cl.client_name,
  cl.sector,
  COUNT(DISTINCT c.id) AS campaign_count,
  COALESCE(SUM(cf.revenue), 0) AS total_revenue,
  AVG(cf.margin_pct) AS avg_margin
FROM agency.clients cl
JOIN agency.campaigns c ON c.client_id = cl.id
LEFT JOIN agency.v_campaign_financials cf ON cf.campaign_id = c.id
WHERE EXTRACT(YEAR FROM cf.period_month) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY cl.id, cl.client_code, cl.client_name, cl.sector
ORDER BY total_revenue DESC NULLS LAST
LIMIT 10;
```

### Query 4: RAG Vector Search (Artifacts + Knowledge)
```sql
-- Find similar artifacts/docs for AI assistant
SELECT 
  kc.document_id,
  kd.title,
  kd.doc_type,
  kc.content,
  1 - (kc.embedding <=> $1::vector) AS similarity
FROM agency.knowledge_chunks kc
JOIN agency.knowledge_documents kd ON kd.id = kc.document_id
WHERE kd.tenant_id = current_setting('app.current_tenant')::uuid
  AND (1 - (kc.embedding <=> $1::vector)) > 0.78
ORDER BY similarity DESC
LIMIT 5;
```

---

## Migration Plan

### Migration 001: Core Agency Schema
```sql
-- File: supabase/migrations/20251207_001_agency_core.sql

CREATE SCHEMA IF NOT EXISTS agency;

-- Create tables: clients, brands, campaigns, campaign_phases
-- (Full DDL from above)

-- Create indexes
-- Create RLS policies
-- Create triggers (updated_at)
```

### Migration 002: Artifacts & Content
```sql
-- File: supabase/migrations/20251207_002_agency_artifacts.sql

-- Create tables: artifacts, artifact_versions, artifact_comments
-- Create indexes
-- Create RLS policies
```

### Migration 003: Timesheets & Capacity
```sql
-- File: supabase/migrations/20251207_003_agency_timesheets.sql

-- Create tables: timesheet_entries, team_allocations
-- Create indexes
-- Create RLS policies
```

### Migration 004: Integration Points
```sql
-- File: supabase/migrations/20251207_004_agency_integration.sql

-- Add FKs to existing tables (Procure, Finance PPM, T&E, Gearroom)
-- Create integration views
```

### Migration 005: AI / RAG
```sql
-- File: supabase/migrations/20251207_005_agency_ai.sql

-- Create tables: knowledge_documents, knowledge_chunks
-- Create tables: ai_conversations, ai_messages
-- Create vector indexes
-- Create RLS policies
```

### Migration 006: Analytics Views
```sql
-- File: supabase/migrations/20251207_006_agency_views.sql

-- Create views: v_dashboard_kpis, v_campaign_overview, v_client_360
-- Create views: v_utilization_by_employee
-- Create functions: get_campaign_expenses
```

---

**Status:** Phase 2 Complete ✅  
**Next:** Phase 3 - Postgres Migrations (SQL DDL)  
**Tables:** 15 core + 10 views  
**Integration Points:** 4 (Procure, Finance PPM, T&E, Gearroom)  
**RAG Tables:** 4 (knowledge_documents, knowledge_chunks, ai_conversations, ai_messages)
