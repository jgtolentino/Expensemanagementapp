-- supabase/migrations/001_rls_policies.sql
-- Row-Level Security (RLS) Policies for TBWA Agency Databank
-- Odoo CE/OCA 18 compliant multi-tenancy

-- ============================================================================
-- 1. RES_COMPANY (Tenants)
-- ============================================================================

ALTER TABLE res_company ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company
CREATE POLICY "Users can view own company"
  ON res_company FOR SELECT
  USING (id = auth.jwt()->>'company_id'::uuid);

-- Only admins can create companies
CREATE POLICY "Admins can create companies"
  ON res_company FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM res_users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Only admins can update companies
CREATE POLICY "Admins can update companies"
  ON res_company FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM res_users
      WHERE id = auth.uid()
      AND is_admin = true
      AND company_id = res_company.id
    )
  );

-- ============================================================================
-- 2. RES_USERS (Users)
-- ============================================================================

ALTER TABLE res_users ENABLE ROW LEVEL SECURITY;

-- Users can view users in their company
CREATE POLICY "Users can view company members"
  ON res_users FOR SELECT
  USING (company_id = auth.jwt()->>'company_id'::uuid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON res_users FOR UPDATE
  USING (id = auth.uid());

-- Admins can manage all users in their company
CREATE POLICY "Admins can manage users"
  ON res_users FOR ALL
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM res_users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- ============================================================================
-- 3. PROJECT_PROJECT (Projects)
-- ============================================================================

ALTER TABLE project_project ENABLE ROW LEVEL SECURITY;

-- Users can view projects in their company
CREATE POLICY "Users can view company projects"
  ON project_project FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND active = true
  );

-- Users can create projects
CREATE POLICY "Users can create projects"
  ON project_project FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND create_uid = auth.uid()
  );

-- Project managers and admins can update projects
CREATE POLICY "Project managers can update projects"
  ON project_project FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      project_manager_id = auth.uid()
      OR auth.uid() = ANY(team_ids)
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND is_admin = true
      )
    )
  );

-- Only admins can delete (soft delete via active flag)
CREATE POLICY "Admins can delete projects"
  ON project_project FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM res_users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (active = false); -- Soft delete only

-- ============================================================================
-- 4. PROJECT_TASK (Tasks)
-- ============================================================================

ALTER TABLE project_task ENABLE ROW LEVEL SECURITY;

-- Users can view tasks in projects they have access to
CREATE POLICY "Users can view accessible tasks"
  ON project_task FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND active = true
    AND EXISTS (
      SELECT 1 FROM project_project p
      WHERE p.id = project_task.project_id
      AND p.company_id = auth.jwt()->>'company_id'::uuid
      AND (
        p.project_manager_id = auth.uid()
        OR auth.uid() = ANY(p.team_ids)
      )
    )
  );

-- Users can create tasks in accessible projects
CREATE POLICY "Users can create tasks"
  ON project_task FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM project_project p
      WHERE p.id = project_task.project_id
      AND (
        p.project_manager_id = auth.uid()
        OR auth.uid() = ANY(p.team_ids)
      )
    )
  );

-- Task owners and assignees can update tasks
CREATE POLICY "Task owners can update tasks"
  ON project_task FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      owner_id = auth.uid()
      OR auth.uid() = ANY(assignee_ids)
      OR EXISTS (
        SELECT 1 FROM project_project p
        WHERE p.id = project_task.project_id
        AND p.project_manager_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 5. HR_EXPENSE_SHEET (Expense Reports)
-- ============================================================================

ALTER TABLE hr_expense_sheet ENABLE ROW LEVEL SECURITY;

-- Employees can view their own expense reports
CREATE POLICY "Employees can view own expenses"
  ON hr_expense_sheet FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      employee_id = auth.uid()
      OR manager_id = auth.uid() -- Manager can view team's expenses
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
  );

-- Employees can create their own expense reports
CREATE POLICY "Employees can create expenses"
  ON hr_expense_sheet FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND employee_id = auth.uid()
  );

-- Employees can update their own draft/rejected reports
CREATE POLICY "Employees can update own expenses"
  ON hr_expense_sheet FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND employee_id = auth.uid()
    AND state IN ('draft', 'rejected')
  );

-- Managers can approve/reject reports
CREATE POLICY "Managers can approve expenses"
  ON hr_expense_sheet FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
    AND state IN ('submitted', 'pending_approval')
  );

-- ============================================================================
-- 6. HR_EXPENSE (Expense Lines)
-- ============================================================================

ALTER TABLE hr_expense ENABLE ROW LEVEL SECURITY;

-- Users can view expense lines based on report access
CREATE POLICY "Users can view expense lines"
  ON hr_expense FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      employee_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM hr_expense_sheet s
        WHERE s.id = hr_expense.expense_report_id
        AND (s.manager_id = auth.uid() OR s.employee_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
  );

-- Employees can create expense lines for their reports
CREATE POLICY "Employees can create expense lines"
  ON hr_expense FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM hr_expense_sheet s
      WHERE s.id = hr_expense.expense_report_id
      AND s.employee_id = auth.uid()
      AND s.state IN ('draft', 'rejected')
    )
  );

-- ============================================================================
-- 7. HR_CASH_ADVANCE (Cash Advances)
-- ============================================================================

ALTER TABLE hr_cash_advance ENABLE ROW LEVEL SECURITY;

-- Similar to expense reports
CREATE POLICY "Employees can view own advances"
  ON hr_cash_advance FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      employee_id = auth.uid()
      OR manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
  );

CREATE POLICY "Employees can create advances"
  ON hr_cash_advance FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND employee_id = auth.uid()
  );

CREATE POLICY "Employees can update own advances"
  ON hr_cash_advance FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND employee_id = auth.uid()
    AND state IN ('draft', 'rejected')
  );

-- ============================================================================
-- 8. SALE_ORDER (Quotes)
-- ============================================================================

ALTER TABLE sale_order ENABLE ROW LEVEL SECURITY;

-- Users can view quotes they created or are involved in
CREATE POLICY "Users can view accessible quotes"
  ON sale_order FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND active = true
    AND (
      account_manager_id = auth.uid()
      OR create_uid = auth.uid()
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
  );

-- Account managers can create quotes
CREATE POLICY "Account managers can create quotes"
  ON sale_order FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND account_manager_id = auth.uid()
  );

-- Account managers can update their quotes
CREATE POLICY "Account managers can update quotes"
  ON sale_order FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      account_manager_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
  );

-- ============================================================================
-- 9. SALE_ORDER_LINE (Quote Lines)
-- ============================================================================

ALTER TABLE sale_order_line ENABLE ROW LEVEL SECURITY;

-- Users can view quote lines based on quote access
CREATE POLICY "Users can view quote lines"
  ON sale_order_line FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM sale_order o
      WHERE o.id = sale_order_line.order_id
      AND o.company_id = auth.jwt()->>'company_id'::uuid
      AND (
        o.account_manager_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM res_users
          WHERE id = auth.uid()
          AND role IN ('finance', 'admin')
        )
      )
    )
  );

-- ============================================================================
-- 10. STOCK_EQUIPMENT (Equipment)
-- ============================================================================

ALTER TABLE stock_equipment ENABLE ROW LEVEL SECURITY;

-- All users can view available equipment
CREATE POLICY "Users can view equipment"
  ON stock_equipment FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND active = true
  );

-- Users can checkout equipment
CREATE POLICY "Users can checkout equipment"
  ON stock_equipment FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      state = 'available' -- Can only checkout available equipment
      OR checked_out_by = auth.uid() -- Can update own checkouts
    )
  );

-- Admins can manage equipment
CREATE POLICY "Admins can manage equipment"
  ON stock_equipment FOR ALL
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM res_users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 11. PURCHASE_ORDER (Procurement)
-- ============================================================================

ALTER TABLE purchase_order ENABLE ROW LEVEL SECURITY;

-- Users can view POs they created or are assigned to approve
CREATE POLICY "Users can view accessible POs"
  ON purchase_order FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      requester_id = auth.uid()
      OR approver_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM res_users
        WHERE id = auth.uid()
        AND role IN ('finance', 'admin')
      )
    )
  );

-- Users can create POs
CREATE POLICY "Users can create POs"
  ON purchase_order FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND requester_id = auth.uid()
  );

-- ============================================================================
-- 12. RES_PARTNER (Clients/Suppliers)
-- ============================================================================

ALTER TABLE res_partner ENABLE ROW LEVEL SECURITY;

-- All company users can view partners
CREATE POLICY "Users can view partners"
  ON res_partner FOR SELECT
  USING (company_id = auth.jwt()->>'company_id'::uuid);

-- Sales and admin can manage partners
CREATE POLICY "Sales can manage partners"
  ON res_partner FOR ALL
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM res_users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- 13. WIKI_PAGE (Wiki/Docs)
-- ============================================================================

ALTER TABLE wiki_page ENABLE ROW LEVEL SECURITY;

-- Users can view published public pages
CREATE POLICY "Users can view public pages"
  ON wiki_page FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      is_public = true
      OR author_id = auth.uid()
      OR auth.uid() = ANY(allowed_user_ids)
    )
    AND state = 'published'
  );

-- Users can create pages
CREATE POLICY "Users can create pages"
  ON wiki_page FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND author_id = auth.uid()
  );

-- Authors can update their pages
CREATE POLICY "Authors can update pages"
  ON wiki_page FOR UPDATE
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND author_id = auth.uid()
  );

-- ============================================================================
-- 14. CREATIVE_ASSET (Creative Workroom)
-- ============================================================================

ALTER TABLE creative_asset ENABLE ROW LEVEL SECURITY;

-- Users can view assets in accessible projects
CREATE POLICY "Users can view project assets"
  ON creative_asset FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM project_project p
      WHERE p.id = creative_asset.project_id
      AND (
        p.project_manager_id = auth.uid()
        OR auth.uid() = ANY(p.team_ids)
      )
    )
  );

-- Users can upload assets to accessible projects
CREATE POLICY "Users can create assets"
  ON creative_asset FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND EXISTS (
      SELECT 1 FROM project_project p
      WHERE p.id = creative_asset.project_id
      AND (
        p.project_manager_id = auth.uid()
        OR auth.uid() = ANY(p.team_ids)
      )
    )
  );

-- ============================================================================
-- 15. BI_DASHBOARD (Business Intelligence)
-- ============================================================================

ALTER TABLE bi_dashboard ENABLE ROW LEVEL SECURITY;

-- Users can view public dashboards or their own
CREATE POLICY "Users can view dashboards"
  ON bi_dashboard FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      is_public = true
      OR owner_id = auth.uid()
      OR auth.uid() = ANY(allowed_user_ids)
    )
  );

-- Users can create their own dashboards
CREATE POLICY "Users can create dashboards"
  ON bi_dashboard FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND owner_id = auth.uid()
  );

-- ============================================================================
-- 16. MAIL_MESSAGE (Chatter/Comments)
-- ============================================================================

ALTER TABLE mail_message ENABLE ROW LEVEL SECURITY;

-- Users can view messages on records they have access to
-- This is complex - simplified version:
CREATE POLICY "Users can view messages"
  ON mail_message FOR SELECT
  USING (
    company_id = auth.jwt()->>'company_id'::uuid
    AND (
      author_id = auth.uid()
      OR auth.uid() = ANY(partner_ids)
    )
  );

-- Users can post messages
CREATE POLICY "Users can create messages"
  ON mail_message FOR INSERT
  WITH CHECK (
    company_id = auth.jwt()->>'company_id'::uuid
    AND author_id = auth.uid()
  );

-- ============================================================================
-- Helper Function: Get User's Company ID from JWT
-- ============================================================================

-- This assumes you're using Supabase Auth with custom claims
-- Set company_id in the JWT during login

-- Example: Update user metadata
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"company_id": "uuid-here"}'::jsonb
-- WHERE id = 'user-uuid';
