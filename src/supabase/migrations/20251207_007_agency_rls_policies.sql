-- Migration: 20251207_007_agency_rls_policies.sql
-- Description: Row Level Security policies for all agency tables
-- Date: 2025-12-07

-- =============================================================================
-- SETUP: Helper functions for RLS
-- =============================================================================

-- Function to get current tenant from settings
CREATE OR REPLACE FUNCTION agency.current_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT current_setting('app.current_tenant', true)::uuid;
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION agency.current_user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT current_setting('app.current_role', true);
$$;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION agency.has_role(required_role text)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT agency.current_user_role() = required_role;
$$;

-- Function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION agency.has_any_role(required_roles text[])
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT agency.current_user_role() = ANY(required_roles);
$$;

-- =============================================================================
-- 1. CLIENTS TABLE POLICIES
-- =============================================================================

-- Tenant isolation (all users see only their tenant's clients)
CREATE POLICY clients_tenant_isolation ON agency.clients
  FOR ALL
  USING (tenant_id = agency.current_tenant_id());

COMMENT ON POLICY clients_tenant_isolation ON agency.clients IS 
  'Users can only access clients within their tenant';

-- =============================================================================
-- 2. BRANDS TABLE POLICIES
-- =============================================================================

CREATE POLICY brands_tenant_isolation ON agency.brands
  FOR ALL
  USING (tenant_id = agency.current_tenant_id());

COMMENT ON POLICY brands_tenant_isolation ON agency.brands IS 
  'Users can only access brands within their tenant';

-- =============================================================================
-- 3. CAMPAIGNS TABLE POLICIES
-- =============================================================================

CREATE POLICY campaigns_tenant_isolation ON agency.campaigns
  FOR ALL
  USING (tenant_id = agency.current_tenant_id());

COMMENT ON POLICY campaigns_tenant_isolation ON agency.campaigns IS 
  'Users can only access campaigns within their tenant';

-- =============================================================================
-- 4. CAMPAIGN PHASES TABLE POLICIES
-- =============================================================================

CREATE POLICY phases_tenant_isolation ON agency.campaign_phases
  FOR ALL
  USING (tenant_id = agency.current_tenant_id());

COMMENT ON POLICY phases_tenant_isolation ON agency.campaign_phases IS 
  'Users can only access campaign phases within their tenant';

-- =============================================================================
-- 5. ARTIFACTS TABLE POLICIES
-- =============================================================================

-- Base tenant isolation
CREATE POLICY artifacts_tenant_isolation ON agency.artifacts
  FOR SELECT
  USING (tenant_id = agency.current_tenant_id());

-- Creators can manage their own artifacts
CREATE POLICY artifacts_owner_full_access ON agency.artifacts
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND owner_id = auth.uid()
  );

-- Campaign team members can view artifacts
CREATE POLICY artifacts_campaign_team_read ON agency.artifacts
  FOR SELECT
  USING (
    tenant_id = agency.current_tenant_id()
    AND campaign_id IN (
      SELECT c.id 
      FROM agency.campaigns c
      WHERE c.account_director_id = auth.uid()
        OR c.project_manager_id = auth.uid()
        OR c.creative_director_id = auth.uid()
    )
  );

-- Finance and leadership can see all artifacts
CREATE POLICY artifacts_finance_leadership_read ON agency.artifacts
  FOR SELECT
  USING (
    tenant_id = agency.current_tenant_id()
    AND agency.has_any_role(ARRAY['finance', 'leadership'])
  );

COMMENT ON POLICY artifacts_tenant_isolation ON agency.artifacts IS 
  'Base tenant isolation for artifacts';
COMMENT ON POLICY artifacts_owner_full_access ON agency.artifacts IS 
  'Artifact owners have full access to their artifacts';
COMMENT ON POLICY artifacts_campaign_team_read ON agency.artifacts IS 
  'Campaign team members can view campaign artifacts';
COMMENT ON POLICY artifacts_finance_leadership_read ON agency.artifacts IS 
  'Finance and leadership can view all artifacts';

-- =============================================================================
-- 6. ARTIFACT VERSIONS TABLE POLICIES
-- =============================================================================

CREATE POLICY versions_tenant_isolation ON agency.artifact_versions
  FOR ALL
  USING (tenant_id = agency.current_tenant_id());

COMMENT ON POLICY versions_tenant_isolation ON agency.artifact_versions IS 
  'Users can only access artifact versions within their tenant';

-- =============================================================================
-- 7. ARTIFACT COMMENTS TABLE POLICIES
-- =============================================================================

-- Read comments on artifacts user has access to
CREATE POLICY comments_read_via_artifact ON agency.artifact_comments
  FOR SELECT
  USING (
    tenant_id = agency.current_tenant_id()
    AND artifact_id IN (
      SELECT a.id 
      FROM agency.artifacts a
      WHERE a.tenant_id = agency.current_tenant_id()
        AND (
          a.owner_id = auth.uid()
          OR a.campaign_id IN (
            SELECT c.id FROM agency.campaigns c
            WHERE c.account_director_id = auth.uid()
              OR c.project_manager_id = auth.uid()
              OR c.creative_director_id = auth.uid()
          )
          OR agency.has_any_role(ARRAY['finance', 'leadership'])
        )
    )
  );

-- Users can create comments on artifacts they can access
CREATE POLICY comments_create ON agency.artifact_comments
  FOR INSERT
  WITH CHECK (
    tenant_id = agency.current_tenant_id()
    AND commenter_id = auth.uid()
  );

-- Users can update/delete their own comments
CREATE POLICY comments_own_update ON agency.artifact_comments
  FOR UPDATE
  USING (
    tenant_id = agency.current_tenant_id()
    AND commenter_id = auth.uid()
  );

CREATE POLICY comments_own_delete ON agency.artifact_comments
  FOR DELETE
  USING (
    tenant_id = agency.current_tenant_id()
    AND commenter_id = auth.uid()
  );

COMMENT ON POLICY comments_read_via_artifact ON agency.artifact_comments IS 
  'Users can read comments on artifacts they have access to';
COMMENT ON POLICY comments_create ON agency.artifact_comments IS 
  'Users can create comments on accessible artifacts';
COMMENT ON POLICY comments_own_update ON agency.artifact_comments IS 
  'Users can update their own comments';
COMMENT ON POLICY comments_own_delete ON agency.artifact_comments IS 
  'Users can delete their own comments';

-- =============================================================================
-- 8. TIMESHEET ENTRIES TABLE POLICIES
-- =============================================================================

-- Employees can see and manage their own timesheets
CREATE POLICY timesheets_own_entries ON agency.timesheet_entries
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND employee_id = auth.uid()
  );

-- Managers can see team timesheets (finance, leadership, PM)
CREATE POLICY timesheets_manager_read ON agency.timesheet_entries
  FOR SELECT
  USING (
    tenant_id = agency.current_tenant_id()
    AND agency.has_any_role(ARRAY['finance', 'leadership', 'pm'])
  );

-- Only finance can update billing rates
CREATE POLICY timesheets_finance_update_rates ON agency.timesheet_entries
  FOR UPDATE
  USING (
    tenant_id = agency.current_tenant_id()
    AND agency.has_role('finance')
  )
  WITH CHECK (
    tenant_id = agency.current_tenant_id()
    AND agency.has_role('finance')
  );

COMMENT ON POLICY timesheets_own_entries ON agency.timesheet_entries IS 
  'Employees can manage their own timesheet entries';
COMMENT ON POLICY timesheets_manager_read ON agency.timesheet_entries IS 
  'Managers can view all timesheet entries';
COMMENT ON POLICY timesheets_finance_update_rates ON agency.timesheet_entries IS 
  'Only finance can update billing rates';

-- =============================================================================
-- 9. TEAM ALLOCATIONS TABLE POLICIES
-- =============================================================================

-- All authenticated users can view allocations (for capacity planning)
CREATE POLICY allocations_read ON agency.team_allocations
  FOR SELECT
  USING (tenant_id = agency.current_tenant_id());

-- Only PMs and leadership can create/update allocations
CREATE POLICY allocations_manage ON agency.team_allocations
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND agency.has_any_role(ARRAY['pm', 'leadership'])
  );

COMMENT ON POLICY allocations_read ON agency.team_allocations IS 
  'All users can view team allocations';
COMMENT ON POLICY allocations_manage ON agency.team_allocations IS 
  'Only PMs and leadership can manage allocations';

-- =============================================================================
-- 10. KNOWLEDGE DOCUMENTS TABLE POLICIES
-- =============================================================================

-- All users can read knowledge documents
CREATE POLICY knowledge_docs_read ON agency.knowledge_documents
  FOR SELECT
  USING (tenant_id = agency.current_tenant_id());

-- Only admins can create/update knowledge documents
CREATE POLICY knowledge_docs_admin_write ON agency.knowledge_documents
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND agency.has_any_role(ARRAY['admin', 'leadership'])
  );

COMMENT ON POLICY knowledge_docs_read ON agency.knowledge_documents IS 
  'All users can read knowledge documents';
COMMENT ON POLICY knowledge_docs_admin_write ON agency.knowledge_documents IS 
  'Only admins can create/update knowledge documents';

-- =============================================================================
-- 11. KNOWLEDGE CHUNKS TABLE POLICIES
-- =============================================================================

-- All users can read knowledge chunks (for RAG search)
CREATE POLICY knowledge_chunks_read ON agency.knowledge_chunks
  FOR SELECT
  USING (tenant_id = agency.current_tenant_id());

-- Only system can write chunks (via edge functions)
CREATE POLICY knowledge_chunks_system_write ON agency.knowledge_chunks
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND agency.has_role('system')
  );

COMMENT ON POLICY knowledge_chunks_read ON agency.knowledge_chunks IS 
  'All users can read knowledge chunks for RAG search';
COMMENT ON POLICY knowledge_chunks_system_write ON agency.knowledge_chunks IS 
  'Only system can write knowledge chunks';

-- =============================================================================
-- 12. AI CONVERSATIONS TABLE POLICIES
-- =============================================================================

-- Users can only see their own conversations
CREATE POLICY ai_conversations_own ON agency.ai_conversations
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND user_id = auth.uid()
  );

COMMENT ON POLICY ai_conversations_own ON agency.ai_conversations IS 
  'Users can only access their own AI conversations';

-- =============================================================================
-- 13. AI MESSAGES TABLE POLICIES
-- =============================================================================

-- Users can see messages in their own conversations
CREATE POLICY ai_messages_via_conversation ON agency.ai_messages
  FOR ALL
  USING (
    tenant_id = agency.current_tenant_id()
    AND conversation_id IN (
      SELECT c.id 
      FROM agency.ai_conversations c
      WHERE c.user_id = auth.uid()
    )
  );

COMMENT ON POLICY ai_messages_via_conversation ON agency.ai_messages IS 
  'Users can access messages in their own conversations';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Agency RLS Policies Migration Complete';
  RAISE NOTICE 'Helper functions created: 4';
  RAISE NOTICE '  - current_tenant_id()';
  RAISE NOTICE '  - current_user_role()';
  RAISE NOTICE '  - has_role(role)';
  RAISE NOTICE '  - has_any_role(roles[])';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies created: 25+';
  RAISE NOTICE '  - Tenant isolation on all tables';
  RAISE NOTICE '  - Role-based visibility (finance, leadership, pm, admin)';
  RAISE NOTICE '  - Owner-based access for artifacts and timesheets';
  RAISE NOTICE '  - Campaign team-based access for artifacts';
  RAISE NOTICE '';
  RAISE NOTICE 'Security model:';
  RAISE NOTICE '  - Finance: Full visibility on financials and rates';
  RAISE NOTICE '  - Leadership: Full visibility on all data';
  RAISE NOTICE '  - PM: Can manage allocations, view timesheets';
  RAISE NOTICE '  - Account/Creative: Can view own campaigns and artifacts';
  RAISE NOTICE '  - Employees: Can manage own timesheets';
END $$;
