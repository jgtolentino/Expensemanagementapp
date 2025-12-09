# Finance Compliance System - Complete Data Model & Integration Architecture

## System Overview

**TBWA Agency Finance Compliance Platform**
- **Frontend**: React + Vite + Tailwind (Microsoft Planner UI)
- **Database**: Supabase Postgres with RLS
- **Backend**: Supabase Edge Functions (Hono server)
- **Integration**: Odoo 18 CE + OCA modules via XML-RPC
- **Automation**: n8n workflows + Supabase cron
- **Auth**: Supabase Auth with RLS + role-based access

---

## 1. Core Database Schema

### 1.1 Authentication & Organizations

```sql
-- Multi-tenant organizations (agencies/departments)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(32) UNIQUE NOT NULL, -- TBWA, OMC, etc.
  odoo_company_id INTEGER,
  currency_code VARCHAR(3) DEFAULT 'PHP',
  tax_identification_number VARCHAR(32),
  rdo_code VARCHAR(16),
  active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  employee_code VARCHAR(16) UNIQUE, -- CKVC, RIM, BOM, etc.
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  position VARCHAR(128),
  department VARCHAR(128),
  odoo_partner_id INTEGER,
  odoo_user_id INTEGER,
  odoo_employee_id INTEGER,
  phone VARCHAR(32),
  avatar_url TEXT,
  role VARCHAR(32) DEFAULT 'user', -- admin, finance_director, finance_manager, supervisor, user
  active BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role definitions
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL, -- responsible, approver, reviewer, informed
  name VARCHAR(64) NOT NULL,
  description TEXT,
  color VARCHAR(7) -- hex color for UI
);

-- Department/Team structure
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  parent_id UUID REFERENCES departments(id),
  head_user_id UUID REFERENCES user_profiles(id),
  odoo_department_id INTEGER,
  active BOOLEAN DEFAULT TRUE,
  UNIQUE(organization_id, code)
);
```

### 1.2 BIR Compliance Module

```sql
-- BIR form types master data
CREATE TABLE bir_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) UNIQUE NOT NULL, -- 1601C, 0619E, 2550Q, 1702RT, 1601EQ
  name VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(32) NOT NULL, -- withholding, vat, income_tax, documentary_stamp
  frequency VARCHAR(16) NOT NULL, -- monthly, quarterly, annual
  filing_method VARCHAR(32), -- ebir, efps, otc, online_portal
  requires_alphalist BOOLEAN DEFAULT FALSE,
  requires_schedules BOOLEAN DEFAULT FALSE,
  penalty_rate_per_day NUMERIC(5,4), -- 0.25% per day example
  penalty_max_percent NUMERIC(5,2), -- 25% max
  bir_url TEXT,
  instructions_url TEXT,
  template_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'
);

-- Calendar of BIR filings (instances per period)
CREATE TABLE bir_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  bir_form_id UUID REFERENCES bir_forms(id) NOT NULL,
  
  -- Period covered
  period_type VARCHAR(16) NOT NULL, -- monthly, quarterly, annual
  period_year INTEGER NOT NULL,
  period_month INTEGER, -- 1-12 for monthly, 1/4/7/10 for quarterly
  period_quarter INTEGER, -- 1-4 for quarterly
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- Deadlines (BIR official)
  bir_deadline_date DATE NOT NULL,
  bir_deadline_adjusted DATE, -- adjusted for weekends/holidays
  
  -- Internal workflow deadlines
  prep_start_date DATE NOT NULL, -- D-10 business days
  prep_due_date DATE NOT NULL, -- D-6 business days
  sfm_review_due_date DATE NOT NULL, -- D-3 business days
  fd_approval_due_date DATE NOT NULL, -- D-2 business days
  filing_target_date DATE NOT NULL, -- D-1 to D
  
  -- Status tracking
  status VARCHAR(32) DEFAULT 'draft', -- draft, in_preparation, under_review, approved, filed, paid, late, cancelled
  workflow_stage VARCHAR(32) DEFAULT 'preparation', -- preparation, sfm_review, fd_approval, filing, payment, completed
  
  -- Assignment (RACI)
  responsible_user_id UUID REFERENCES user_profiles(id), -- BOM
  reviewer_user_id UUID REFERENCES user_profiles(id), -- RIM
  approver_user_id UUID REFERENCES user_profiles(id), -- CKVC
  informed_user_ids UUID[], -- array of user IDs
  
  -- Financial data
  tax_base_amount NUMERIC(18,2),
  tax_due_amount NUMERIC(18,2),
  penalty_amount NUMERIC(18,2) DEFAULT 0,
  interest_amount NUMERIC(18,2) DEFAULT 0,
  total_amount_due NUMERIC(18,2),
  amount_paid NUMERIC(18,2),
  
  -- Filing proof
  filed_at TIMESTAMPTZ,
  filed_by_user_id UUID REFERENCES user_profiles(id),
  bir_confirmation_number VARCHAR(128),
  bir_receipt_number VARCHAR(128),
  
  -- Payment proof
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(32), -- online_banking, check, otc, gcash
  payment_reference VARCHAR(128),
  bank_name VARCHAR(128),
  check_number VARCHAR(64),
  
  -- Document attachments (Supabase Storage keys)
  working_file_url TEXT,
  bir_form_pdf_url TEXT,
  alphalist_url TEXT,
  schedules_url TEXT,
  payment_voucher_url TEXT,
  bir_receipt_url TEXT,
  bank_proof_url TEXT,
  
  -- Integration
  odoo_task_id INTEGER,
  odoo_account_move_id INTEGER, -- link to journal entry
  odoo_payment_id INTEGER,
  
  -- Notes and audit
  notes TEXT,
  late_reason TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization_id, bir_form_id, period_start_date)
);

-- BIR filing tasks (4 standard tasks per filing)
CREATE TABLE bir_filing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID REFERENCES bir_filings(id) ON DELETE CASCADE,
  
  sequence INTEGER NOT NULL, -- 1=Prep, 2=SFM Review, 3=FD Approval, 4=Filing & Payment
  task_type VARCHAR(32) NOT NULL, -- preparation, sfm_review, fd_approval, filing_payment
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Assignment
  assigned_to_user_id UUID REFERENCES user_profiles(id) NOT NULL,
  reviewer_user_id UUID REFERENCES user_profiles(id),
  
  -- Scheduling
  due_date DATE NOT NULL,
  estimated_hours NUMERIC(4,1),
  
  -- Status
  status VARCHAR(32) DEFAULT 'pending', -- pending, in_progress, under_review, approved, rejected, completed, late
  priority VARCHAR(16) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Completion
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES user_profiles(id),
  
  -- Review/Approval
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES user_profiles(id),
  approval_notes TEXT,
  
  -- Integration
  odoo_task_id INTEGER,
  odoo_activity_id INTEGER,
  n8n_execution_id VARCHAR(64),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items per task
CREATE TABLE bir_task_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES bir_filing_tasks(id) ON DELETE CASCADE,
  
  sequence INTEGER NOT NULL,
  label TEXT NOT NULL,
  category VARCHAR(64), -- data_gathering, computation, form_filling, validation, documentation
  
  is_required BOOLEAN DEFAULT TRUE,
  is_done BOOLEAN DEFAULT FALSE,
  
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES user_profiles(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standard checklist templates (reusable across filings)
CREATE TABLE bir_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bir_form_id UUID REFERENCES bir_forms(id),
  task_type VARCHAR(32) NOT NULL, -- preparation, sfm_review, fd_approval, filing_payment
  
  sequence INTEGER NOT NULL,
  label TEXT NOT NULL,
  category VARCHAR(64),
  is_required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Month-End Closing Module

```sql
-- Month-end task templates (master list from your Excel)
CREATE TABLE month_end_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- Task identification
  wbs_code VARCHAR(32) UNIQUE NOT NULL, -- IM1.1, IM1.2, IM2.1, etc.
  task_category VARCHAR(128) NOT NULL, -- Payroll & Personnel, VAT & Taxes, Accruals, etc.
  task_name VARCHAR(255) NOT NULL,
  detailed_description TEXT NOT NULL,
  
  -- Assignment template
  default_responsible_code VARCHAR(16), -- RIM, BOM, CKVC, etc.
  default_reviewer_code VARCHAR(16),
  default_approver_code VARCHAR(16),
  
  -- Timing (working days relative to month-end)
  frequency VARCHAR(32) DEFAULT 'monthly', -- monthly, quarterly, annual
  timing_reference VARCHAR(32) DEFAULT 'working_day', -- working_day, calendar_day
  preparation_days NUMERIC(4,1) NOT NULL, -- e.g., 1.0, 2.0, 3.0
  review_days NUMERIC(4,1),
  approval_days NUMERIC(4,1),
  
  -- SLA
  sla_description VARCHAR(255), -- "Complete by WD +1", "4 BD before VAT deadline"
  
  -- Related BIR filings (if applicable)
  related_bir_form_ids UUID[], -- array of bir_forms.id
  
  -- Dependencies
  depends_on_template_ids UUID[], -- must complete these first
  blocking_for_template_ids UUID[], -- blocks these tasks
  
  -- GL accounts involved
  account_codes TEXT[], -- array of account codes
  
  -- Integration
  odoo_project_id INTEGER,
  odoo_project_template_id INTEGER,
  
  -- Metadata
  color_code VARCHAR(7), -- from your Excel color coding
  department VARCHAR(64),
  cost_center VARCHAR(32),
  priority INTEGER DEFAULT 5, -- 1-10
  estimated_hours NUMERIC(4,1),
  
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Month-end closing periods (e.g., Dec 2025 close, Jan 2026 close, etc.)
CREATE TABLE month_end_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  
  -- Period being closed
  closing_year INTEGER NOT NULL,
  closing_month INTEGER NOT NULL, -- 1-12
  period_name VARCHAR(64), -- "December 2025 Close"
  
  -- Dates
  period_start_date DATE NOT NULL, -- first day of month
  period_end_date DATE NOT NULL, -- last day of month
  close_start_date DATE NOT NULL, -- when closing process starts
  close_target_date DATE NOT NULL, -- target completion (e.g., WD+5)
  
  -- Status
  status VARCHAR(32) DEFAULT 'planned', -- planned, in_progress, review, completed, late
  progress_percent INTEGER DEFAULT 0,
  
  -- Key milestones
  gl_freeze_at TIMESTAMPTZ, -- when GL posting stops
  tb_finalized_at TIMESTAMPTZ, -- trial balance locked
  completed_at TIMESTAMPTZ,
  
  -- Assignment
  coordinator_user_id UUID REFERENCES user_profiles(id), -- overall owner (e.g., CKVC)
  
  -- Integration
  odoo_fiscal_period_id INTEGER,
  odoo_project_id INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, closing_year, closing_month)
);

-- Month-end task instances (generated from templates for each period)
CREATE TABLE month_end_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES month_end_periods(id) ON DELETE CASCADE,
  template_id UUID REFERENCES month_end_task_templates(id),
  
  -- Task details
  wbs_code VARCHAR(32) NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Assignment (RACI)
  responsible_user_id UUID REFERENCES user_profiles(id) NOT NULL,
  reviewer_user_id UUID REFERENCES user_profiles(id),
  approver_user_id UUID REFERENCES user_profiles(id),
  informed_user_ids UUID[],
  
  -- Scheduling
  due_date DATE NOT NULL,
  estimated_hours NUMERIC(4,1),
  
  -- Status
  status VARCHAR(32) DEFAULT 'pending', -- pending, in_progress, under_review, approved, completed, blocked, late
  priority VARCHAR(16) DEFAULT 'normal',
  
  -- Progress
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES user_profiles(id),
  
  -- Review cycle
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES user_profiles(id),
  approval_notes TEXT,
  
  -- Dependencies
  depends_on_task_ids UUID[],
  blocked_by_task_ids UUID[], -- currently blocked by these
  
  -- Attachments (Supabase Storage)
  attachment_urls TEXT[],
  
  -- Integration
  odoo_task_id INTEGER,
  odoo_account_move_ids INTEGER[], -- related JEs
  
  -- Metadata
  color_code VARCHAR(7),
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Month-end checklist items
CREATE TABLE month_end_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES month_end_tasks(id) ON DELETE CASCADE,
  
  sequence INTEGER NOT NULL,
  label TEXT NOT NULL,
  category VARCHAR(64),
  
  is_required BOOLEAN DEFAULT TRUE,
  is_done BOOLEAN DEFAULT FALSE,
  
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES user_profiles(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Month-end checklist templates
CREATE TABLE month_end_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES month_end_task_templates(id),
  
  sequence INTEGER NOT NULL,
  label TEXT NOT NULL,
  category VARCHAR(64),
  is_required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Workflow & Collaboration

```sql
-- Comments/notes on filings and tasks
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- Polymorphic reference
  entity_type VARCHAR(32) NOT NULL, -- bir_filing, bir_task, month_end_task, etc.
  entity_id UUID NOT NULL,
  
  -- Comment
  body TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  
  -- Threading
  parent_comment_id UUID REFERENCES comments(id),
  
  -- Mentions
  mentioned_user_ids UUID[],
  
  -- Attachments
  attachment_urls TEXT[],
  
  -- Flags
  is_internal BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log / audit trail
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- What changed
  entity_type VARCHAR(32) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(32) NOT NULL, -- created, updated, deleted, status_changed, assigned, approved, rejected
  
  -- Who
  user_id UUID REFERENCES user_profiles(id),
  
  -- Details
  changes JSONB, -- before/after snapshot
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications queue
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- Recipient
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  
  -- Content
  notification_type VARCHAR(32) NOT NULL, -- task_assigned, task_due, approval_request, comment_mention, status_change
  title VARCHAR(255) NOT NULL,
  body TEXT,
  
  -- Link
  entity_type VARCHAR(32),
  entity_id UUID,
  action_url TEXT,
  
  -- Delivery
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  sent_via_email BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  priority VARCHAR(16) DEFAULT 'normal', -- low, normal, high, urgent
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email queue (for outbound emails)
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- Recipients
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  
  -- Content
  subject VARCHAR(512) NOT NULL,
  body_html TEXT,
  body_text TEXT,
  
  -- Metadata
  template_name VARCHAR(64),
  template_data JSONB,
  
  -- Scheduling
  send_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  status VARCHAR(32) DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retries INTEGER DEFAULT 0,
  
  -- Related entity
  entity_type VARCHAR(32),
  entity_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.5 Document Management

```sql
-- File attachments (metadata; actual files in Supabase Storage)
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- What it's attached to
  entity_type VARCHAR(32) NOT NULL,
  entity_id UUID NOT NULL,
  
  -- File info
  filename VARCHAR(512) NOT NULL,
  storage_path TEXT NOT NULL, -- path in Supabase Storage bucket
  file_size_bytes BIGINT,
  mime_type VARCHAR(128),
  
  -- Categorization
  document_type VARCHAR(64), -- working_file, bir_form, alphalist, receipt, bank_proof, etc.
  description TEXT,
  
  -- Upload info
  uploaded_by_user_id UUID REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Version control
  version INTEGER DEFAULT 1,
  replaces_attachment_id UUID REFERENCES attachments(id),
  
  -- Access
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document templates library
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  -- Template info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(64), -- bir_working_file, payment_voucher, memo, checklist
  
  -- File
  storage_path TEXT NOT NULL,
  filename VARCHAR(512),
  file_format VARCHAR(32), -- xlsx, docx, pdf
  
  -- Categorization
  category VARCHAR(64),
  tags TEXT[],
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  created_by_user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.6 Calendar & Scheduling

```sql
-- Master calendar (holidays, special dates)
CREATE TABLE calendar_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  
  -- Classification
  is_working_day BOOLEAN DEFAULT TRUE,
  is_weekend BOOLEAN DEFAULT FALSE,
  is_holiday BOOLEAN DEFAULT FALSE,
  holiday_type VARCHAR(32), -- regular_holiday, special_nonworking, special_working
  holiday_name VARCHAR(255),
  
  -- Country/region
  country_code VARCHAR(2) DEFAULT 'PH',
  region_code VARCHAR(32),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, date)
);

-- Working day calculator helper function
CREATE OR REPLACE FUNCTION add_working_days(
  p_start_date DATE,
  p_num_days INTEGER,
  p_org_id UUID
) RETURNS DATE AS $$
DECLARE
  v_result_date DATE := p_start_date;
  v_days_added INTEGER := 0;
BEGIN
  WHILE v_days_added < p_num_days LOOP
    v_result_date := v_result_date + INTERVAL '1 day';
    IF EXISTS (
      SELECT 1 FROM calendar_dates
      WHERE organization_id = p_org_id
        AND date = v_result_date
        AND is_working_day = TRUE
    ) THEN
      v_days_added := v_days_added + 1;
    END IF;
  END LOOP;
  RETURN v_result_date;
END;
$$ LANGUAGE plpgsql;
```

### 1.7 Reporting & Analytics Views

```sql
-- BIR compliance dashboard view
CREATE VIEW v_bir_compliance_dashboard AS
SELECT
  bf.id AS filing_id,
  bf.organization_id,
  bform.code AS bir_form_code,
  bform.name AS bir_form_name,
  bf.period_start_date,
  bf.period_end_date,
  bf.bir_deadline_date,
  bf.status,
  bf.workflow_stage,
  bf.total_amount_due,
  bf.amount_paid,
  
  -- Days until deadline
  bf.bir_deadline_date - CURRENT_DATE AS days_until_deadline,
  
  -- Assignment
  resp.full_name AS responsible_name,
  resp.email AS responsible_email,
  rev.full_name AS reviewer_name,
  app.full_name AS approver_name,
  
  -- Task progress
  (SELECT COUNT(*) FROM bir_filing_tasks WHERE filing_id = bf.id) AS total_tasks,
  (SELECT COUNT(*) FROM bir_filing_tasks WHERE filing_id = bf.id AND status = 'completed') AS completed_tasks,
  
  -- Status flags
  CASE
    WHEN bf.bir_deadline_date < CURRENT_DATE AND bf.status != 'filed' THEN 'overdue'
    WHEN bf.bir_deadline_date - CURRENT_DATE <= 3 AND bf.status != 'filed' THEN 'urgent'
    WHEN bf.bir_deadline_date - CURRENT_DATE <= 7 THEN 'due_soon'
    ELSE 'on_track'
  END AS urgency_status,
  
  bf.created_at,
  bf.updated_at
FROM bir_filings bf
JOIN bir_forms bform ON bform.id = bf.bir_form_id
LEFT JOIN user_profiles resp ON resp.id = bf.responsible_user_id
LEFT JOIN user_profiles rev ON rev.id = bf.reviewer_user_id
LEFT JOIN user_profiles app ON app.id = bf.approver_user_id
WHERE bf.status NOT IN ('cancelled');

-- Month-end closing progress view
CREATE VIEW v_month_end_progress AS
SELECT
  p.id AS period_id,
  p.organization_id,
  p.period_name,
  p.closing_year,
  p.closing_month,
  p.close_target_date,
  p.status AS period_status,
  
  -- Task counts
  COUNT(t.id) AS total_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END) AS blocked_tasks,
  SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 ELSE 0 END) AS overdue_tasks,
  
  -- Progress percentage
  ROUND(
    100.0 * SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(t.id), 0),
    1
  ) AS completion_percent,
  
  -- Coordinator
  coord.full_name AS coordinator_name,
  coord.email AS coordinator_email,
  
  p.created_at,
  p.updated_at
FROM month_end_periods p
LEFT JOIN month_end_tasks t ON t.period_id = p.id
LEFT JOIN user_profiles coord ON coord.id = p.coordinator_user_id
GROUP BY p.id, coord.full_name, coord.email;

-- User workload view
CREATE VIEW v_user_workload AS
SELECT
  u.id AS user_id,
  u.full_name,
  u.email,
  u.employee_code,
  u.position,
  u.organization_id,
  
  -- BIR tasks
  COUNT(DISTINCT bt.id) AS bir_tasks_count,
  SUM(CASE WHEN bt.status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) AS bir_tasks_active,
  SUM(CASE WHEN bt.due_date < CURRENT_DATE AND bt.status != 'completed' THEN 1 ELSE 0 END) AS bir_tasks_overdue,
  
  -- Month-end tasks
  COUNT(DISTINCT met.id) AS month_end_tasks_count,
  SUM(CASE WHEN met.status IN ('pending', 'in_progress') THEN 1 ELSE 0 END) AS month_end_tasks_active,
  SUM(CASE WHEN met.due_date < CURRENT_DATE AND met.status != 'completed' THEN 1 ELSE 0 END) AS month_end_tasks_overdue,
  
  -- Total workload
  SUM(COALESCE(bt.estimated_hours, 0)) + SUM(COALESCE(met.estimated_hours, 0)) AS estimated_hours_total
  
FROM user_profiles u
LEFT JOIN bir_filing_tasks bt ON bt.assigned_to_user_id = u.id AND bt.status != 'completed'
LEFT JOIN month_end_tasks met ON met.responsible_user_id = u.id AND met.status != 'completed'
WHERE u.active = TRUE
GROUP BY u.id;
```

---

## 2. Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bir_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bir_filing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_end_tasks ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables

-- Helper function to get current user's organization
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM user_profiles
  WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION auth.user_has_role(p_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
      AND role = p_role
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS Policy: Users can only see data from their organization
CREATE POLICY org_isolation_policy ON bir_filings
  FOR ALL
  USING (organization_id = auth.user_organization_id());

CREATE POLICY org_isolation_policy ON month_end_tasks
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM month_end_periods WHERE id = period_id
    )
  );

-- RLS Policy: Users can see their assigned tasks
CREATE POLICY user_tasks_policy ON bir_filing_tasks
  FOR SELECT
  USING (
    assigned_to_user_id = auth.uid()
    OR reviewer_user_id = auth.uid()
    OR auth.user_has_role('admin')
    OR auth.user_has_role('finance_director')
  );

-- RLS Policy: Only finance managers can update task status
CREATE POLICY task_update_policy ON bir_filing_tasks
  FOR UPDATE
  USING (
    assigned_to_user_id = auth.uid()
    OR auth.user_has_role('admin')
    OR auth.user_has_role('finance_director')
    OR auth.user_has_role('finance_manager')
  );

-- Similar policies for all sensitive tables...
```

---

## 3. API Endpoints (Supabase Edge Functions)

### 3.1 Server Setup (`/supabase/functions/server/index.tsx`)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger(console.log))

// Supabase client factory
const getSupabaseClient = (accessToken?: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = accessToken
    ? Deno.env.get('SUPABASE_ANON_KEY')!
    : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }
  })
}

// Auth middleware
const requireAuth = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  c.set('user', user)
  c.set('accessToken', token)
  await next()
}

// Health check
app.get('/make-server-7fad9ebd/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Import route modules
import birRoutes from './routes/bir.ts'
import monthEndRoutes from './routes/month-end.ts'
import calendarRoutes from './routes/calendar.ts'
import notificationRoutes from './routes/notifications.ts'

// Register routes
app.route('/make-server-7fad9ebd/api/bir', birRoutes)
app.route('/make-server-7fad9ebd/api/month-end', monthEndRoutes)
app.route('/make-server-7fad9ebd/api/calendar', calendarRoutes)
app.route('/make-server-7fad9ebd/api/notifications', notificationRoutes)

serve(app.fetch)
```

### 3.2 BIR Module Endpoints (`/supabase/functions/server/routes/bir.ts`)

```typescript
import { Hono } from 'npm:hono'

const bir = new Hono()

// GET /api/bir/forms - List all BIR form types
bir.get('/forms', async (c) => {
  const supabase = c.get('supabase')
  
  const { data, error } = await supabase
    .from('bir_forms')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ forms: data })
})

// GET /api/bir/filings - List BIR filings with filters
bir.get('/filings', async (c) => {
  const supabase = c.get('supabase')
  const { status, year, form_code, responsible_user_id } = c.req.query()
  
  let query = supabase
    .from('bir_filings')
    .select(`
      *,
      bir_form:bir_forms(*),
      responsible:user_profiles!responsible_user_id(*),
      reviewer:user_profiles!reviewer_user_id(*),
      approver:user_profiles!approver_user_id(*),
      tasks:bir_filing_tasks(*)
    `)
  
  if (status) query = query.eq('status', status)
  if (year) query = query.eq('period_year', year)
  if (form_code) query = query.eq('bir_forms.code', form_code)
  if (responsible_user_id) query = query.eq('responsible_user_id', responsible_user_id)
  
  query = query.order('bir_deadline_date', { ascending: true })
  
  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)
  
  return c.json({ filings: data })
})

// POST /api/bir/filings - Create new filing
bir.post('/filings', async (c) => {
  const supabase = c.get('supabase')
  const body = await c.req.json()
  
  // Validate required fields
  if (!body.bir_form_id || !body.period_start_date || !body.bir_deadline_date) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  // Calculate internal deadlines
  const birDeadline = new Date(body.bir_deadline_date)
  body.prep_due_date = addBusinessDays(birDeadline, -6)
  body.sfm_review_due_date = addBusinessDays(birDeadline, -3)
  body.fd_approval_due_date = addBusinessDays(birDeadline, -2)
  body.filing_target_date = addBusinessDays(birDeadline, -1)
  
  const { data, error } = await supabase
    .from('bir_filings')
    .insert(body)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Create standard tasks
  await createStandardBIRTasks(supabase, data.id)
  
  return c.json({ filing: data }, 201)
})

// PUT /api/bir/filings/:id - Update filing
bir.put('/filings/:id', async (c) => {
  const supabase = c.get('supabase')
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const { data, error } = await supabase
    .from('bir_filings')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ filing: data })
})

// POST /api/bir/filings/:id/tasks - Create task for filing
bir.post('/filings/:id/tasks', async (c) => {
  const supabase = c.get('supabase')
  const filingId = c.req.param('id')
  const body = await c.req.json()
  
  body.filing_id = filingId
  
  const { data, error } = await supabase
    .from('bir_filing_tasks')
    .insert(body)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Create checklist items from template
  await createChecklistFromTemplate(supabase, data.id, body.task_type)
  
  return c.json({ task: data }, 201)
})

// PUT /api/bir/tasks/:id/status - Update task status
bir.put('/tasks/:id/status', async (c) => {
  const supabase = c.get('supabase')
  const taskId = c.req.param('id')
  const { status, notes } = await c.req.json()
  
  const updates: any = { status }
  
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
    updates.completed_by_user_id = c.get('user').id
  } else if (status === 'in_progress' && !updates.started_at) {
    updates.started_at = new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('bir_filing_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Trigger notification to reviewer/approver
  await sendTaskStatusNotification(supabase, data)
  
  return c.json({ task: data })
})

// POST /api/bir/filings/:id/approve - Approve filing (for SFM/FD)
bir.post('/filings/:id/approve', async (c) => {
  const supabase = c.get('supabase')
  const filingId = c.req.param('id')
  const user = c.get('user')
  const { approval_type, notes } = await c.req.json() // 'sfm' or 'fd'
  
  // Update filing workflow stage
  const updates: any = {}
  if (approval_type === 'sfm') {
    updates.workflow_stage = 'fd_approval'
  } else if (approval_type === 'fd') {
    updates.workflow_stage = 'filing'
    updates.status = 'approved'
  }
  
  const { data, error } = await supabase
    .from('bir_filings')
    .update(updates)
    .eq('id', filingId)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Log activity
  await logActivity(supabase, {
    entity_type: 'bir_filing',
    entity_id: filingId,
    action: `${approval_type}_approved`,
    user_id: user.id,
    metadata: { notes }
  })
  
  // Send notification to next approver
  await sendApprovalNotification(supabase, data, approval_type)
  
  return c.json({ filing: data })
})

// POST /api/bir/filings/:id/file - Mark filing as filed
bir.post('/filings/:id/file', async (c) => {
  const supabase = c.get('supabase')
  const filingId = c.req.param('id')
  const { bir_confirmation_number, bir_receipt_number, filed_at } = await c.req.json()
  
  const { data, error } = await supabase
    .from('bir_filings')
    .update({
      status: 'filed',
      workflow_stage: 'payment',
      filed_at: filed_at || new Date().toISOString(),
      filed_by_user_id: c.get('user').id,
      bir_confirmation_number,
      bir_receipt_number
    })
    .eq('id', filingId)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ filing: data })
})

// POST /api/bir/generate-calendar - Generate BIR filings for a year
bir.post('/generate-calendar', async (c) => {
  const supabase = c.get('supabase')
  const { year, organization_id } = await c.req.json()
  
  if (!year || !organization_id) {
    return c.json({ error: 'Missing year or organization_id' }, 400)
  }
  
  // Get all active BIR forms
  const { data: forms, error: formsError } = await supabase
    .from('bir_forms')
    .select('*')
    .eq('active', true)
  
  if (formsError) return c.json({ error: formsError.message }, 500)
  
  const filings = []
  
  for (const form of forms) {
    if (form.frequency === 'monthly') {
      // Generate 12 filings
      for (let month = 1; month <= 12; month++) {
        const filing = generateMonthlyFiling(form, year, month, organization_id)
        filings.push(filing)
      }
    } else if (form.frequency === 'quarterly') {
      // Generate 4 filings
      for (let quarter = 1; quarter <= 4; quarter++) {
        const filing = generateQuarterlyFiling(form, year, quarter, organization_id)
        filings.push(filing)
      }
    } else if (form.frequency === 'annual') {
      // Generate 1 filing
      const filing = generateAnnualFiling(form, year, organization_id)
      filings.push(filing)
    }
  }
  
  const { data, error } = await supabase
    .from('bir_filings')
    .insert(filings)
    .select()
  
  if (error) return c.json({ error: error.message }, 500)
  
  return c.json({ generated: data.length, filings: data }, 201)
})

export default bir
```

### 3.3 Month-End Endpoints (`/supabase/functions/server/routes/month-end.ts`)

```typescript
import { Hono } from 'npm:hono'

const monthEnd = new Hono()

// GET /api/month-end/periods - List closing periods
monthEnd.get('/periods', async (c) => {
  const supabase = c.get('supabase')
  const { year, status } = c.req.query()
  
  let query = supabase
    .from('month_end_periods')
    .select(`
      *,
      coordinator:user_profiles!coordinator_user_id(*),
      tasks:month_end_tasks(count)
    `)
  
  if (year) query = query.eq('closing_year', year)
  if (status) query = query.eq('status', status)
  
  query = query.order('period_start_date', { ascending: false })
  
  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)
  
  return c.json({ periods: data })
})

// POST /api/month-end/periods - Create new closing period
monthEnd.post('/periods', async (c) => {
  const supabase = c.get('supabase')
  const body = await c.req.json()
  
  const { data, error } = await supabase
    .from('month_end_periods')
    .insert(body)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Generate tasks from templates
  await generateMonthEndTasks(supabase, data.id, body.organization_id)
  
  return c.json({ period: data }, 201)
})

// GET /api/month-end/tasks - List month-end tasks
monthEnd.get('/tasks', async (c) => {
  const supabase = c.get('supabase')
  const { period_id, responsible_user_id, status } = c.req.query()
  
  let query = supabase
    .from('month_end_tasks')
    .select(`
      *,
      period:month_end_periods(*),
      responsible:user_profiles!responsible_user_id(*),
      reviewer:user_profiles!reviewer_user_id(*),
      approver:user_profiles!approver_user_id(*),
      checklist:month_end_checklist_items(*)
    `)
  
  if (period_id) query = query.eq('period_id', period_id)
  if (responsible_user_id) query = query.eq('responsible_user_id', responsible_user_id)
  if (status) query = query.eq('status', status)
  
  query = query.order('due_date')
  
  const { data, error } = await query
  if (error) return c.json({ error: error.message }, 500)
  
  return c.json({ tasks: data })
})

// PUT /api/month-end/tasks/:id - Update task
monthEnd.put('/tasks/:id', async (c) => {
  const supabase = c.get('supabase')
  const taskId = c.req.param('id')
  const body = await c.req.json()
  
  const { data, error } = await supabase
    .from('month_end_tasks')
    .update(body)
    .eq('id', taskId)
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Update period progress
  await updatePeriodProgress(supabase, data.period_id)
  
  return c.json({ task: data })
})

// POST /api/month-end/templates/:id/instantiate - Create task from template
monthEnd.post('/templates/:id/instantiate', async (c) => {
  const supabase = c.get('supabase')
  const templateId = c.req.param('id')
  const { period_id, due_date } = await c.req.json()
  
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('month_end_task_templates')
    .select('*')
    .eq('id', templateId)
    .single()
  
  if (templateError) return c.json({ error: templateError.message }, 500)
  
  // Resolve employee codes to user IDs
  const responsible_user_id = await resolveEmployeeCode(supabase, template.default_responsible_code)
  const reviewer_user_id = await resolveEmployeeCode(supabase, template.default_reviewer_code)
  const approver_user_id = await resolveEmployeeCode(supabase, template.default_approver_code)
  
  // Create task instance
  const { data, error } = await supabase
    .from('month_end_tasks')
    .insert({
      period_id,
      template_id: templateId,
      wbs_code: template.wbs_code,
      task_name: template.task_name,
      description: template.detailed_description,
      responsible_user_id,
      reviewer_user_id,
      approver_user_id,
      due_date,
      estimated_hours: template.estimated_hours,
      color_code: template.color_code
    })
    .select()
    .single()
  
  if (error) return c.json({ error: error.message }, 500)
  
  // Copy checklist items
  await copyChecklistItems(supabase, templateId, data.id)
  
  return c.json({ task: data }, 201)
})

export default monthEnd
```

### 3.4 Helper Functions

```typescript
// Add business days (excluding weekends and holidays)
function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date)
  let daysAdded = 0
  
  while (daysAdded < Math.abs(days)) {
    result.setDate(result.getDate() + (days > 0 ? 1 : -1))
    const dayOfWeek = result.getDay()
    
    // Skip weekends (0=Sunday, 6=Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // TODO: Check against calendar_dates table for holidays
      daysAdded++
    }
  }
  
  return result
}

// Create standard BIR tasks for a filing
async function createStandardBIRTasks(supabase: any, filingId: string) {
  const { data: filing } = await supabase
    .from('bir_filings')
    .select('*, bir_form:bir_forms(*)')
    .eq('id', filingId)
    .single()
  
  const tasks = [
    {
      filing_id: filingId,
      sequence: 1,
      task_type: 'preparation',
      name: `Prepare ${filing.bir_form.code} form and compute tax`,
      description: 'Gather data, compute tax base, fill out BIR form draft, prepare payment request',
      assigned_to_user_id: filing.responsible_user_id,
      due_date: filing.prep_due_date,
      status: 'pending'
    },
    {
      filing_id: filingId,
      sequence: 2,
      task_type: 'sfm_review',
      name: 'SFM Review and Approval',
      description: 'Review accuracy, validate tax base, verify attachments',
      assigned_to_user_id: filing.reviewer_user_id,
      reviewer_user_id: filing.reviewer_user_id,
      due_date: filing.sfm_review_due_date,
      status: 'pending'
    },
    {
      filing_id: filingId,
      sequence: 3,
      task_type: 'fd_approval',
      name: 'FD Approval for Payment',
      description: 'Approve funding, sign check voucher',
      assigned_to_user_id: filing.approver_user_id,
      approver_user_id: filing.approver_user_id,
      due_date: filing.fd_approval_due_date,
      status: 'pending'
    },
    {
      filing_id: filingId,
      sequence: 4,
      task_type: 'filing_payment',
      name: 'File Return and Remit Payment',
      description: 'File via eBIR/eFPS, remit payment, upload proofs',
      assigned_to_user_id: filing.responsible_user_id,
      due_date: filing.filing_target_date,
      status: 'pending'
    }
  ]
  
  const { error } = await supabase
    .from('bir_filing_tasks')
    .insert(tasks)
  
  if (error) console.error('Error creating BIR tasks:', error)
}

// Create checklist items from template
async function createChecklistFromTemplate(supabase: any, taskId: string, taskType: string) {
  // Get task's filing and form
  const { data: task } = await supabase
    .from('bir_filing_tasks')
    .select('filing:bir_filings(bir_form_id)')
    .eq('id', taskId)
    .single()
  
  const { data: templates } = await supabase
    .from('bir_checklist_templates')
    .select('*')
    .eq('bir_form_id', task.filing.bir_form_id)
    .eq('task_type', taskType)
    .order('sequence')
  
  if (templates && templates.length > 0) {
    const items = templates.map(t => ({
      task_id: taskId,
      sequence: t.sequence,
      label: t.label,
      category: t.category,
      is_required: t.is_required
    }))
    
    await supabase
      .from('bir_task_checklist_items')
      .insert(items)
  }
}

// Generate month-end tasks from templates
async function generateMonthEndTasks(supabase: any, periodId: string, orgId: string) {
  const { data: period } = await supabase
    .from('month_end_periods')
    .select('*')
    .eq('id', periodId)
    .single()
  
  const { data: templates } = await supabase
    .from('month_end_task_templates')
    .select('*')
    .eq('organization_id', orgId)
    .eq('active', true)
    .order('sort_order')
  
  const tasks = []
  
  for (const template of templates) {
    // Calculate due date based on close_target_date + working days
    const dueDate = addBusinessDays(
      new Date(period.close_target_date),
      template.preparation_days
    )
    
    // Resolve employee codes to user IDs
    const responsibleUser = await resolveEmployeeCode(supabase, template.default_responsible_code)
    const reviewerUser = await resolveEmployeeCode(supabase, template.default_reviewer_code)
    const approverUser = await resolveEmployeeCode(supabase, template.default_approver_code)
    
    tasks.push({
      period_id: periodId,
      template_id: template.id,
      wbs_code: template.wbs_code,
      task_name: template.task_name,
      description: template.detailed_description,
      responsible_user_id: responsibleUser,
      reviewer_user_id: reviewerUser,
      approver_user_id: approverUser,
      due_date: dueDate.toISOString().split('T')[0],
      estimated_hours: template.estimated_hours,
      color_code: template.color_code,
      status: 'pending'
    })
  }
  
  const { error } = await supabase
    .from('month_end_tasks')
    .insert(tasks)
  
  if (error) console.error('Error generating month-end tasks:', error)
}

// Resolve employee code to user ID
async function resolveEmployeeCode(supabase: any, code: string): Promise<string | null> {
  if (!code) return null
  
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('employee_code', code)
    .single()
  
  return data?.id || null
}
```

---

## 4. Integration with Odoo via XML-RPC

### 4.1 Odoo Connection Helper

```typescript
// /supabase/functions/server/lib/odoo.ts
import xmlrpc from 'npm:xmlrpc'

export class OdooClient {
  private url: string
  private db: string
  private username: string
  private password: string
  private uid: number | null = null
  
  constructor() {
    this.url = Deno.env.get('ODOO_URL') || 'https://odoo.tbwa.com'
    this.db = Deno.env.get('ODOO_DB') || 'tbwa_production'
    this.username = Deno.env.get('ODOO_USERNAME')!
    this.password = Deno.env.get('ODOO_PASSWORD')!
  }
  
  async authenticate() {
    const client = xmlrpc.createSecureClient(`${this.url}/xmlrpc/2/common`)
    
    return new Promise((resolve, reject) => {
      client.methodCall('authenticate', [
        this.db,
        this.username,
        this.password,
        {}
      ], (err, uid) => {
        if (err) reject(err)
        else {
          this.uid = uid
          resolve(uid)
        }
      })
    })
  }
  
  async execute(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    if (!this.uid) await this.authenticate()
    
    const client = xmlrpc.createSecureClient(`${this.url}/xmlrpc/2/object`)
    
    return new Promise((resolve, reject) => {
      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        model,
        method,
        args,
        kwargs
      ], (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
  
  // Create project task in Odoo
  async createTask(data: {
    name: string
    description?: string
    date_deadline?: string
    user_id?: number
    project_id?: number
  }) {
    return this.execute('project.task', 'create', [[data]])
  }
  
  // Update task status
  async updateTaskStatus(taskId: number, status: string) {
    return this.execute('project.task', 'write', [[taskId], { stage_id: status }])
  }
  
  // Create accounting entry (journal entry)
  async createAccountMove(data: {
    move_type: string
    partner_id?: number
    date: string
    line_ids: any[]
  }) {
    return this.execute('account.move', 'create', [[data]])
  }
  
  // Search for partner (employee, supplier, etc.)
  async searchPartner(name: string) {
    return this.execute('res.partner', 'search_read', [[['name', 'ilike', name]]], {
      fields: ['id', 'name', 'email'],
      limit: 10
    })
  }
}
```

### 4.2 Sync BIR Filing to Odoo Task

```typescript
// When creating a BIR filing, optionally create Odoo task
async function syncBIRFilingToOdoo(supabase: any, filing: any) {
  const odoo = new OdooClient()
  
  try {
    const taskId = await odoo.createTask({
      name: `BIR ${filing.bir_form.code} - ${filing.period_start_date}`,
      description: `Filing deadline: ${filing.bir_deadline_date}`,
      date_deadline: filing.bir_deadline_date,
      user_id: filing.odoo_user_id,
      project_id: Deno.env.get('ODOO_COMPLIANCE_PROJECT_ID')
    })
    
    // Save Odoo task ID back to Supabase
    await supabase
      .from('bir_filings')
      .update({ odoo_task_id: taskId })
      .eq('id', filing.id)
    
    console.log(`Created Odoo task ${taskId} for BIR filing ${filing.id}`)
  } catch (error) {
    console.error('Failed to sync to Odoo:', error)
  }
}
```

---

## 5. n8n Workflows

### 5.1 Daily Reminder Workflow

**Trigger:** Cron – every day at 8:00 AM Asia/Manila

**Nodes:**

1. **Cron Trigger** – `0 8 * * *` (Manila time)

2. **Postgres: Get Upcoming Tasks**
```sql
SELECT
  t.id,
  t.name,
  t.due_date,
  t.status,
  u.full_name,
  u.email,
  f.bir_deadline_date,
  bf.code AS form_code
FROM bir_filing_tasks t
JOIN user_profiles u ON u.id = t.assigned_to_user_id
JOIN bir_filings f ON f.id = t.filing_id
JOIN bir_forms bf ON bf.id = f.bir_form_id
WHERE t.status IN ('pending', 'in_progress')
  AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
ORDER BY t.due_date;
```

3. **IF Node** – Branch by `due_date`
   - **Overdue**: `due_date < CURRENT_DATE`
   - **Due Today**: `due_date = CURRENT_DATE`
   - **Due Soon**: `due_date > CURRENT_DATE`

4. **Email Node** – Send notification
   - **To:** `{{$json.email}}`
   - **Subject:** `[BIR] {{$json.name}} – Due {{$json.due_date}}`
   - **Body:**
```
Hi {{$json.full_name}},

This is a reminder that your BIR task "{{$json.name}}" is due on {{$json.due_date}}.

BIR Form: {{$json.form_code}}
Filing Deadline: {{$json.bir_deadline_date}}
Status: {{$json.status}}

Please complete this task on time to avoid penalties.

View task: https://app.tbwa.com/finance-compliance/bir/{{$json.id}}

Thanks,
TBWA Finance Compliance System
```

5. **Supabase: Insert Notification**
```json
{
  "user_id": "{{$json.assigned_to_user_id}}",
  "notification_type": "task_due",
  "title": "{{$json.name}} – Due {{$json.due_date}}",
  "entity_type": "bir_task",
  "entity_id": "{{$json.id}}",
  "sent_via_email": true
}
```

### 5.2 Month-End Task Generation Workflow

**Trigger:** Cron – 1st day of each month at 6:00 AM

**Nodes:**

1. **Cron Trigger** – `0 6 1 * *`

2. **JS Code Node** – Calculate previous month
```javascript
const now = new Date();
const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

return {
  closing_year: prevMonth.getFullYear(),
  closing_month: prevMonth.getMonth() + 1,
  period_name: `${prevMonth.toLocaleString('default', { month: 'long' })} ${prevMonth.getFullYear()} Close`,
  period_start_date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toISOString().split('T')[0],
  period_end_date: new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toISOString().split('T')[0]
};
```

3. **HTTP: Create Month-End Period**
   - **Method:** POST
   - **URL:** `https://PROJECT_ID.supabase.co/functions/v1/make-server-7fad9ebd/api/month-end/periods`
   - **Headers:** `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
   - **Body:** JSON from previous node

4. **HTTP: Generate Tasks**
   (Calls `/api/month-end/periods/:id/generate-tasks` endpoint)

5. **Slack/Email: Notify Finance Team**

### 5.3 BIR Late Filing Escalation Workflow

**Trigger:** Cron – every day at 5:00 PM

**Nodes:**

1. **Postgres: Get Overdue Filings**
```sql
SELECT
  f.id,
  f.bir_deadline_date,
  bf.code AS form_code,
  resp.full_name AS responsible_name,
  resp.email AS responsible_email,
  dir.email AS director_email
FROM bir_filings f
JOIN bir_forms bf ON bf.id = f.bir_form_id
JOIN user_profiles resp ON resp.id = f.responsible_user_id
JOIN user_profiles dir ON dir.id = f.approver_user_id
WHERE f.status NOT IN ('filed', 'cancelled')
  AND f.bir_deadline_date < CURRENT_DATE;
```

2. **Email: Escalate to Director**
   - **To:** `{{$json.director_email}}`
   - **CC:** `{{$json.responsible_email}}`
   - **Subject:** `[URGENT] Overdue BIR Filing – {{$json.form_code}}`

3. **Supabase: Update Filing Status**
```json
{
  "status": "late",
  "late_reason": "Auto-escalated due to missed deadline"
}
```

---

## 6. Cron Jobs (Supabase Edge Functions)

### 6.1 Create Cron Jobs via Supabase CLI

```bash
# Daily reminders
supabase functions schedule create daily-reminders \
  --schedule "0 8 * * *" \
  --function make-server-7fad9ebd/cron/daily-reminders

# Month-end task generation
supabase functions schedule create month-end-generator \
  --schedule "0 6 1 * *" \
  --function make-server-7fad9ebd/cron/month-end-generator

# Late filing escalation
supabase functions schedule create late-filing-check \
  --schedule "0 17 * * *" \
  --function make-server-7fad9ebd/cron/late-filing-check
```

### 6.2 Cron Function Example

```typescript
// /supabase/functions/make-server-7fad9ebd/cron/daily-reminders.ts
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Get tasks due in next 3 days
  const { data: tasks, error } = await supabase
    .from('bir_filing_tasks')
    .select(`
      *,
      filing:bir_filings(bir_deadline_date, bir_form:bir_forms(code)),
      assigned_user:user_profiles!assigned_to_user_id(full_name, email)
    `)
    .in('status', ['pending', 'in_progress'])
    .gte('due_date', new Date().toISOString().split('T')[0])
    .lte('due_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  
  if (error) {
    console.error('Error fetching tasks:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  
  // Queue email notifications
  const emails = tasks.map(task => ({
    to_addresses: [task.assigned_user.email],
    subject: `[BIR] ${task.name} – Due ${task.due_date}`,
    body_html: generateEmailBody(task),
    template_name: 'bir_task_reminder',
    entity_type: 'bir_task',
    entity_id: task.id
  }))
  
  const { error: emailError } = await supabase
    .from('email_queue')
    .insert(emails)
  
  if (emailError) {
    console.error('Error queueing emails:', emailError)
  }
  
  // Also create in-app notifications
  const notifications = tasks.map(task => ({
    user_id: task.assigned_to_user_id,
    notification_type: 'task_due',
    title: `${task.name} – Due ${task.due_date}`,
    body: `BIR Form: ${task.filing.bir_form.code}, Filing Deadline: ${task.filing.bir_deadline_date}`,
    entity_type: 'bir_task',
    entity_id: task.id,
    action_url: `/finance-compliance/bir/tasks/${task.id}`,
    priority: task.due_date === new Date().toISOString().split('T')[0] ? 'high' : 'normal'
  }))
  
  await supabase
    .from('notifications')
    .insert(notifications)
  
  return new Response(JSON.stringify({
    success: true,
    tasks_processed: tasks.length,
    emails_queued: emails.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

function generateEmailBody(task: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <body>
      <h2>BIR Task Reminder</h2>
      <p>Hi ${task.assigned_user.full_name},</p>
      <p>This is a reminder that your BIR task is due soon:</p>
      <ul>
        <li><strong>Task:</strong> ${task.name}</li>
        <li><strong>Due Date:</strong> ${task.due_date}</li>
        <li><strong>BIR Form:</strong> ${task.filing.bir_form.code}</li>
        <li><strong>Filing Deadline:</strong> ${task.filing.bir_deadline_date}</li>
        <li><strong>Status:</strong> ${task.status}</li>
      </ul>
      <p><a href="https://app.tbwa.com/finance-compliance/bir/tasks/${task.id}">View Task →</a></p>
      <p>Thanks,<br>TBWA Finance Compliance System</p>
    </body>
    </html>
  `
}
```

---

## 7. Data Flow Summary

### 7.1 BIR Filing Lifecycle

```
[Create Filing] → [Generate Tasks] → [Preparation] → [SFM Review] → [FD Approval] → [Filing] → [Payment] → [Completed]
     ↓                ↓                  ↓               ↓              ↓            ↓           ↓
  [Supabase]      [n8n/Cron]        [Assign]       [Notify]       [Approve]    [Upload]    [Close]
     ↓                                  ↓               ↓              ↓                        ↓
  [Odoo Sync]                      [Email Alert]   [Escalate]    [Odoo JE]              [Audit Log]
```

### 7.2 Month-End Closing Lifecycle

```
[Period Created] → [Generate Tasks from Templates] → [Assign to Users] → [Execute Tasks] → [Review] → [Approve] → [Complete]
       ↓                      ↓                            ↓                   ↓              ↓           ↓
   [Auto/Manual]          [n8n Cron]                  [RACI Matrix]       [Check Dependencies] → [Update Progress]
       ↓                      ↓                            ↓                                           ↓
   [Supabase]            [Supabase]                   [Notifications]                            [Dashboard]
```

### 7.3 Integration Points

**Supabase ↔ Frontend:**
- REST API via Edge Functions
- Real-time subscriptions for task updates
- RLS for data security

**Supabase ↔ Odoo:**
- XML-RPC for syncing tasks, journal entries
- Bidirectional: Create tasks in Odoo when BIR filing created
- Sync employee/partner master data

**Supabase ↔ n8n:**
- n8n queries Supabase via Postgres node
- n8n calls Supabase Edge Functions via HTTP
- n8n sends emails and Slack notifications

**Odoo ↔ n8n:**
- n8n can call Odoo XML-RPC directly if needed
- Useful for complex workflows (e.g., approval routing)

---

## 8. Frontend Data Fetching Patterns

### 8.1 React Hooks for Data

```typescript
// /hooks/useBIRFilings.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBIRFilings(filters = {}) {
  const [filings, setFilings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchFilings() {
      try {
        setLoading(true)
        
        let query = supabase
          .from('bir_filings')
          .select(`
            *,
            bir_form:bir_forms(*),
            responsible:user_profiles!responsible_user_id(*),
            reviewer:user_profiles!reviewer_user_id(*),
            approver:user_profiles!approver_user_id(*),
            tasks:bir_filing_tasks(*)
          `)
        
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.year) query = query.eq('period_year', filters.year)
        
        query = query.order('bir_deadline_date', { ascending: true })
        
        const { data, error } = await query
        
        if (error) throw error
        setFilings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFilings()
    
    // Real-time subscription
    const subscription = supabase
      .channel('bir_filings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bir_filings'
      }, (payload) => {
        console.log('BIR filing changed:', payload)
        fetchFilings() // Refetch
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [filters])
  
  return { filings, loading, error }
}
```

### 8.2 API Client

```typescript
// /lib/api.ts
import { projectId, publicAnonKey } from './supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7fad9ebd/api`

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('supabase.auth.token') // or use Supabase client
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API call failed')
  }
  
  return response.json()
}

// BIR API
export const birAPI = {
  getForms: () => apiCall('/bir/forms'),
  getFilings: (params) => apiCall(`/bir/filings?${new URLSearchParams(params)}`),
  createFiling: (data) => apiCall('/bir/filings', { method: 'POST', body: JSON.stringify(data) }),
  updateFiling: (id, data) => apiCall(`/bir/filings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approveFiling: (id, type, notes) => apiCall(`/bir/filings/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approval_type: type, notes })
  }),
  fileFiling: (id, data) => apiCall(`/bir/filings/${id}/file`, { method: 'POST', body: JSON.stringify(data) })
}

// Month-End API
export const monthEndAPI = {
  getPeriods: (params) => apiCall(`/month-end/periods?${new URLSearchParams(params)}`),
  createPeriod: (data) => apiCall('/month-end/periods', { method: 'POST', body: JSON.stringify(data) }),
  getTasks: (params) => apiCall(`/month-end/tasks?${new URLSearchParams(params)}`),
  updateTask: (id, data) => apiCall(`/month-end/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
```

---

## 9. Next Steps for Implementation

1. **Database Setup:**
   - Run all SQL scripts in Supabase SQL Editor
   - Load seed data (bir_forms, roles, calendar_dates)
   - Configure RLS policies

2. **Backend:**
   - Deploy Edge Functions (Hono server)
   - Test all API endpoints with Postman/Insomnia
   - Set up Odoo XML-RPC integration

3. **Automation:**
   - Create n8n workflows (daily reminders, task generation, escalations)
   - Set up Supabase cron jobs
   - Test email delivery

4. **Frontend:**
   - Build React components for BIR and Month-End modules
   - Implement authentication flow
   - Connect to Supabase and API endpoints

5. **Testing:**
   - Seed test data (users, filings, tasks)
   - Test complete BIR filing lifecycle
   - Test month-end closing workflow
   - Verify notifications and emails

6. **Deployment:**
   - Deploy Supabase functions
   - Deploy n8n workflows
   - Deploy React frontend
   - Configure Odoo integration

---

This is your complete data model and integration architecture. Let me know if you'd like me to proceed with building any specific component (frontend UI, seed data scripts, or testing scenarios).
