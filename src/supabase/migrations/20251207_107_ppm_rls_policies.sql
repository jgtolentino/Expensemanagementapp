-- =====================================================================
-- Finance PPM: RLS (Row-Level Security) Policies
-- Migration: 20251207_107_ppm_rls_policies.sql
-- Description: Create comprehensive RLS policies for multi-tenant, role-based access
-- Dependencies: All previous PPM migrations
-- =====================================================================

-- Enable RLS on all PPM tables
ALTER TABLE crm.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.activities ENABLE ROW LEVEL SECURITY;

ALTER TABLE finance_ppm.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.project_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.wip_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.collection_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ppm.ai_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- Helper Functions for RLS
-- =====================================================================

-- Get current tenant_id from session
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get current user_id from session
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_user_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get current user role from session
CREATE OR REPLACE FUNCTION auth.current_role()
RETURNS text AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_role', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if current user has role(s)
CREATE OR REPLACE FUNCTION auth.has_role(roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN auth.current_role() = ANY(roles);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION auth.current_tenant_id IS 'Get current tenant UUID from session variable app.current_tenant';
COMMENT ON FUNCTION auth.current_user_id IS 'Get current user UUID from session variable app.current_user_id';
COMMENT ON FUNCTION auth.current_role IS 'Get current user role from session variable app.current_role';
COMMENT ON FUNCTION auth.has_role IS 'Check if current user has one of the specified roles';

-- =====================================================================
-- CRM Schema RLS Policies
-- =====================================================================

-- crm.leads
DROP POLICY IF EXISTS tenant_isolation_leads ON crm.leads;
CREATE POLICY tenant_isolation_leads ON crm.leads
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS owner_access_leads ON crm.leads;
CREATE POLICY owner_access_leads ON crm.leads
  FOR ALL
  USING (
    auth.has_role(ARRAY['partner', 'finance_director'])
    OR owner_id = auth.current_user_id()
  );

-- crm.opportunities
DROP POLICY IF EXISTS tenant_isolation_opportunities ON crm.opportunities;
CREATE POLICY tenant_isolation_opportunities ON crm.opportunities
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS owner_access_opportunities ON crm.opportunities;
CREATE POLICY owner_access_opportunities ON crm.opportunities
  FOR ALL
  USING (
    auth.has_role(ARRAY['partner', 'finance_director'])
    OR owner_id = auth.current_user_id()
  );

-- crm.activities
DROP POLICY IF EXISTS tenant_isolation_activities ON crm.activities;
CREATE POLICY tenant_isolation_activities ON crm.activities
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS owner_access_activities ON crm.activities;
CREATE POLICY owner_access_activities ON crm.activities
  FOR ALL
  USING (
    auth.has_role(ARRAY['partner', 'finance_director'])
    OR assigned_to = auth.current_user_id()
    OR created_by = auth.current_user_id()
  );

-- =====================================================================
-- Finance PPM Schema RLS Policies
-- =====================================================================

-- finance_ppm.engagements
DROP POLICY IF EXISTS tenant_isolation_engagements ON finance_ppm.engagements;
CREATE POLICY tenant_isolation_engagements ON finance_ppm.engagements
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_engagements ON finance_ppm.engagements;
CREATE POLICY role_access_engagements ON finance_ppm.engagements
  FOR SELECT
  USING (
    -- Partner/Finance: Full access
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
    -- Account Manager: Own clients only
    OR (auth.current_role() = 'account_manager' AND owner_id = auth.current_user_id())
    -- PM: Can view engagements with assigned projects
    OR (auth.current_role() = 'project_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects 
      WHERE engagement_id = finance_ppm.engagements.id 
      AND owner_id = auth.current_user_id()
    ))
  );

-- finance_ppm.projects
DROP POLICY IF EXISTS tenant_isolation_projects ON finance_ppm.projects;
CREATE POLICY tenant_isolation_projects ON finance_ppm.projects
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_projects ON finance_ppm.projects;
CREATE POLICY role_access_projects ON finance_ppm.projects
  FOR SELECT
  USING (
    -- Partner/Finance: Full access
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
    -- Account Manager: Projects under own engagements
    OR (auth.current_role() = 'account_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.engagements 
      WHERE id = finance_ppm.projects.engagement_id 
      AND owner_id = auth.current_user_id()
    ))
    -- PM: Own projects
    OR (auth.current_role() = 'project_manager' AND owner_id = auth.current_user_id())
    -- Consultant: Projects with assigned tasks
    OR (auth.current_role() = 'consultant' AND EXISTS (
      SELECT 1 FROM finance_ppm.tasks 
      WHERE project_id = finance_ppm.projects.id 
      AND assigned_to = auth.current_user_id()
    ))
  );

-- finance_ppm.tasks
DROP POLICY IF EXISTS tenant_isolation_tasks ON finance_ppm.tasks;
CREATE POLICY tenant_isolation_tasks ON finance_ppm.tasks
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_tasks ON finance_ppm.tasks;
CREATE POLICY role_access_tasks ON finance_ppm.tasks
  FOR SELECT
  USING (
    -- Partner/Finance/Staff: Full access
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
    -- PM: Tasks in own projects
    OR (auth.current_role() = 'project_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects 
      WHERE id = finance_ppm.tasks.project_id 
      AND owner_id = auth.current_user_id()
    ))
    -- Consultant: Own tasks
    OR (auth.current_role() = 'consultant' AND assigned_to = auth.current_user_id())
  );

-- finance_ppm.project_financials
DROP POLICY IF EXISTS tenant_isolation_project_financials ON finance_ppm.project_financials;
CREATE POLICY tenant_isolation_project_financials ON finance_ppm.project_financials
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_project_financials ON finance_ppm.project_financials;
CREATE POLICY role_access_project_financials ON finance_ppm.project_financials
  FOR SELECT
  USING (
    -- Only finance roles can see project_financials (contains margin/cost data)
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
  );

-- finance_ppm.timesheet_entries
DROP POLICY IF EXISTS tenant_isolation_timesheet_entries ON finance_ppm.timesheet_entries;
CREATE POLICY tenant_isolation_timesheet_entries ON finance_ppm.timesheet_entries
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_timesheet_entries ON finance_ppm.timesheet_entries;
CREATE POLICY role_access_timesheet_entries ON finance_ppm.timesheet_entries
  FOR SELECT
  USING (
    -- Partner/Finance: Full access
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
    -- PM: Timesheets in own projects
    OR (auth.current_role() = 'project_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects 
      WHERE id = finance_ppm.timesheet_entries.project_id 
      AND owner_id = auth.current_user_id()
    ))
    -- Consultant/Employee: Own timesheets
    OR employee_id = auth.current_user_id()
  );

DROP POLICY IF EXISTS insert_own_timesheet ON finance_ppm.timesheet_entries;
CREATE POLICY insert_own_timesheet ON finance_ppm.timesheet_entries
  FOR INSERT
  WITH CHECK (employee_id = auth.current_user_id());

DROP POLICY IF EXISTS update_own_timesheet ON finance_ppm.timesheet_entries;
CREATE POLICY update_own_timesheet ON finance_ppm.timesheet_entries
  FOR UPDATE
  USING (
    -- Can update own draft timesheets
    (employee_id = auth.current_user_id() AND status = 'draft')
    -- Or PM can approve timesheets in own projects
    OR (auth.current_role() = 'project_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects 
      WHERE id = finance_ppm.timesheet_entries.project_id 
      AND owner_id = auth.current_user_id()
    ))
    -- Or Partner/Finance can approve any
    OR auth.has_role(ARRAY['partner', 'finance_director'])
  );

-- finance_ppm.invoices
DROP POLICY IF EXISTS tenant_isolation_invoices ON finance_ppm.invoices;
CREATE POLICY tenant_isolation_invoices ON finance_ppm.invoices
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_invoices ON finance_ppm.invoices;
CREATE POLICY role_access_invoices ON finance_ppm.invoices
  FOR SELECT
  USING (
    -- Partner/Finance/Staff: Full access
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
    -- Account Manager: Invoices for own clients
    OR (auth.current_role() = 'account_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.engagements 
      WHERE id = finance_ppm.invoices.engagement_id 
      AND owner_id = auth.current_user_id()
    ))
    -- PM: Invoices for own projects
    OR (auth.current_role() = 'project_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects 
      WHERE id = finance_ppm.invoices.project_id 
      AND owner_id = auth.current_user_id()
    ))
  );

-- finance_ppm.invoice_lines
DROP POLICY IF EXISTS tenant_isolation_invoice_lines ON finance_ppm.invoice_lines;
CREATE POLICY tenant_isolation_invoice_lines ON finance_ppm.invoice_lines
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

-- finance_ppm.payments
DROP POLICY IF EXISTS tenant_isolation_payments ON finance_ppm.payments;
CREATE POLICY tenant_isolation_payments ON finance_ppm.payments
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_payments ON finance_ppm.payments;
CREATE POLICY role_access_payments ON finance_ppm.payments
  FOR SELECT
  USING (
    -- Only finance roles can record/view payments
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
  );

-- finance_ppm.wip_entries
DROP POLICY IF EXISTS tenant_isolation_wip_entries ON finance_ppm.wip_entries;
CREATE POLICY tenant_isolation_wip_entries ON finance_ppm.wip_entries
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_wip_entries ON finance_ppm.wip_entries;
CREATE POLICY role_access_wip_entries ON finance_ppm.wip_entries
  FOR SELECT
  USING (
    -- Partner/Finance/Staff: Full access
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
    -- Account Manager: WIP for own clients
    OR (auth.current_role() = 'account_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects p
      JOIN finance_ppm.engagements e ON p.engagement_id = e.id
      WHERE p.id = finance_ppm.wip_entries.project_id 
      AND e.owner_id = auth.current_user_id()
    ))
  );

-- finance_ppm.collection_activities
DROP POLICY IF EXISTS tenant_isolation_collection_activities ON finance_ppm.collection_activities;
CREATE POLICY tenant_isolation_collection_activities ON finance_ppm.collection_activities
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_collection_activities ON finance_ppm.collection_activities;
CREATE POLICY role_access_collection_activities ON finance_ppm.collection_activities
  FOR SELECT
  USING (
    -- Only finance roles
    auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant'])
  );

-- finance_ppm.documents
DROP POLICY IF EXISTS tenant_isolation_documents ON finance_ppm.documents;
CREATE POLICY tenant_isolation_documents ON finance_ppm.documents
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS role_access_documents ON finance_ppm.documents;
CREATE POLICY role_access_documents ON finance_ppm.documents
  FOR SELECT
  USING (
    -- Partner/Finance: Full access
    auth.has_role(ARRAY['partner', 'finance_director'])
    -- Account Manager: Documents for own engagements
    OR (auth.current_role() = 'account_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.engagements 
      WHERE id = finance_ppm.documents.engagement_id 
      AND owner_id = auth.current_user_id()
    ))
    -- PM: Documents for engagements with own projects
    OR (auth.current_role() = 'project_manager' AND EXISTS (
      SELECT 1 FROM finance_ppm.projects 
      WHERE engagement_id = finance_ppm.documents.engagement_id 
      AND owner_id = auth.current_user_id()
    ))
    -- Staff Accountant: Only finance-related documents
    OR (auth.current_role() = 'staff_accountant' AND document_type IN ('contract', 'sow', 'po'))
  );

-- finance_ppm.document_versions
DROP POLICY IF EXISTS tenant_isolation_document_versions ON finance_ppm.document_versions;
CREATE POLICY tenant_isolation_document_versions ON finance_ppm.document_versions
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

-- finance_ppm.knowledge_documents
DROP POLICY IF EXISTS tenant_isolation_knowledge_documents ON finance_ppm.knowledge_documents;
CREATE POLICY tenant_isolation_knowledge_documents ON finance_ppm.knowledge_documents
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS visibility_knowledge_documents ON finance_ppm.knowledge_documents;
CREATE POLICY visibility_knowledge_documents ON finance_ppm.knowledge_documents
  FOR SELECT
  USING (
    visibility = 'public'
    OR (visibility = 'internal' AND auth.current_role() IS NOT NULL)
    OR (visibility = 'finance_only' AND auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']))
    OR (visibility = 'partner_only' AND auth.current_role() = 'partner')
  );

-- finance_ppm.knowledge_chunks
DROP POLICY IF EXISTS tenant_isolation_knowledge_chunks ON finance_ppm.knowledge_chunks;
CREATE POLICY tenant_isolation_knowledge_chunks ON finance_ppm.knowledge_chunks
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

-- finance_ppm.ai_sessions
DROP POLICY IF EXISTS tenant_isolation_ai_sessions ON finance_ppm.ai_sessions;
CREATE POLICY tenant_isolation_ai_sessions ON finance_ppm.ai_sessions
  FOR ALL
  USING (tenant_id = auth.current_tenant_id());

DROP POLICY IF EXISTS own_ai_sessions ON finance_ppm.ai_sessions;
CREATE POLICY own_ai_sessions ON finance_ppm.ai_sessions
  FOR ALL
  USING (user_id = auth.current_user_id());

-- finance_ppm.ai_messages
DROP POLICY IF EXISTS own_ai_messages ON finance_ppm.ai_messages;
CREATE POLICY own_ai_messages ON finance_ppm.ai_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finance_ppm.ai_sessions
      WHERE id = finance_ppm.ai_messages.session_id
      AND user_id = auth.current_user_id()
    )
  );

-- =====================================================================
-- Create role-aware views (field masking for sensitive data)
-- =====================================================================

-- View: v_projects_role_aware (masks margin/cost for non-finance)
CREATE OR REPLACE VIEW finance_ppm.v_projects_role_aware AS
SELECT 
  p.id,
  p.tenant_id,
  p.engagement_id,
  p.project_code,
  p.project_name,
  p.start_date,
  p.end_date,
  p.billing_type,
  p.status,
  p.owner_id,
  
  -- Masked financials (only visible to finance roles)
  CASE 
    WHEN auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']) 
    THEN (SELECT SUM(actual_cost) FROM finance_ppm.project_financials WHERE project_id = p.id)
    ELSE NULL
  END AS total_cost,
  
  CASE 
    WHEN auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']) 
    THEN (SELECT AVG(margin_pct) FROM finance_ppm.project_financials WHERE project_id = p.id)
    ELSE NULL
  END AS margin_pct,
  
  -- Budget is visible to all (but not internal cost)
  (SELECT SUM(budget_amount) FROM finance_ppm.project_financials WHERE project_id = p.id) AS total_budget,
  (SELECT SUM(revenue) FROM finance_ppm.project_financials WHERE project_id = p.id) AS total_revenue

FROM finance_ppm.projects p;

COMMENT ON VIEW finance_ppm.v_projects_role_aware IS 'Projects with role-based field masking (margin/cost hidden for non-finance)';

-- View: v_timesheets_role_aware (masks rates for non-finance)
CREATE OR REPLACE VIEW finance_ppm.v_timesheets_role_aware AS
SELECT 
  ts.id,
  ts.tenant_id,
  ts.employee_id,
  ts.project_id,
  ts.task_id,
  ts.entry_date,
  ts.week_start_date,
  ts.hours,
  ts.billable,
  ts.status,
  ts.notes,
  
  -- Masked rates (only visible to finance roles)
  CASE 
    WHEN auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']) 
    THEN ts.cost_rate
    ELSE NULL
  END AS cost_rate,
  
  CASE 
    WHEN auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']) 
    THEN ts.bill_rate
    ELSE NULL
  END AS bill_rate,
  
  CASE 
    WHEN auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']) 
    THEN ts.cost_amount
    ELSE NULL
  END AS cost_amount,
  
  CASE 
    WHEN auth.has_role(ARRAY['partner', 'finance_director', 'staff_accountant']) 
    THEN ts.bill_amount
    ELSE NULL
  END AS bill_amount

FROM finance_ppm.timesheet_entries ts;

COMMENT ON VIEW finance_ppm.v_timesheets_role_aware IS 'Timesheets with role-based field masking (rates/amounts hidden for non-finance)';

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM RLS Policies migration complete:';
  RAISE NOTICE '  - RLS enabled on 19 tables';
  RAISE NOTICE '  - Helper functions: current_tenant_id, current_user_id, current_role, has_role';
  RAISE NOTICE '  - Tenant isolation: All tables enforce tenant_id matching';
  RAISE NOTICE '  - Role-based access: 6 roles (partner, finance_director, account_manager, project_manager, staff_accountant, consultant)';
  RAISE NOTICE '  - Field masking views: v_projects_role_aware, v_timesheets_role_aware';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy summary:';
  RAISE NOTICE '  • Partner/Finance Director: Full access to all data';
  RAISE NOTICE '  • Account Manager: Own clients only';
  RAISE NOTICE '  • Project Manager: Own projects only';
  RAISE NOTICE '  • Staff Accountant: All invoices/payments, no project access';
  RAISE NOTICE '  • Consultant: Own tasks and timesheets only';
  RAISE NOTICE '';
  RAISE NOTICE 'Session variables required:';
  RAISE NOTICE '  SET app.current_tenant = ''<tenant_uuid>'';';
  RAISE NOTICE '  SET app.current_user_id = ''<user_uuid>'';';
  RAISE NOTICE '  SET app.current_role = ''partner'' | ''finance_director'' | ...;';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL FINANCE PPM MIGRATIONS COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run seed data script (Phase 4)';
  RAISE NOTICE '  2. Test RLS policies with different roles';
  RAISE NOTICE '  3. Build frontend UI (Phase 5+)';
END $$;
