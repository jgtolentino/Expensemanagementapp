-- =====================================================================
-- Scout Dashboard - Migration 6: Row Level Security Policies
-- =====================================================================
-- Purpose: Enable RLS and create tenant-based policies
-- Dependencies: 20251207_204_scout_ai_rag.sql
-- Author: TBWA Agency Databank
-- Date: 2025-12-07
-- =====================================================================

-- =====================================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================================

ALTER TABLE scout.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.ai_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- HELPER FUNCTION: Get user's tenant_id
-- =====================================================================

CREATE OR REPLACE FUNCTION scout.get_user_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id
  FROM core.users
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION scout.get_user_tenant_id TO authenticated;

-- =====================================================================
-- POLICIES: scout.stores
-- =====================================================================

CREATE POLICY "Users can view stores in their tenant"
  ON scout.stores FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to stores"
  ON scout.stores FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.brands
-- =====================================================================

CREATE POLICY "Users can view brands in their tenant"
  ON scout.brands FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to brands"
  ON scout.brands FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.products
-- =====================================================================

CREATE POLICY "Users can view products in their tenant"
  ON scout.products FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to products"
  ON scout.products FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.customers
-- =====================================================================

CREATE POLICY "Users can view customers in their tenant"
  ON scout.customers FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to customers"
  ON scout.customers FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.transactions
-- =====================================================================

CREATE POLICY "Users can view transactions in their tenant"
  ON scout.transactions FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to transactions"
  ON scout.transactions FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.baskets
-- =====================================================================

CREATE POLICY "Users can view baskets in their tenant"
  ON scout.baskets FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to baskets"
  ON scout.baskets FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.recommendations
-- =====================================================================

CREATE POLICY "Users can view recommendations in their tenant"
  ON scout.recommendations FOR SELECT
  USING (tenant_id = scout.get_user_tenant_id());

CREATE POLICY "Service role has full access to recommendations"
  ON scout.recommendations FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.knowledge_documents
-- =====================================================================

CREATE POLICY "Users can view knowledge documents in their tenant"
  ON scout.knowledge_documents FOR SELECT
  USING (
    tenant_id = scout.get_user_tenant_id()
    AND (
      visibility_roles IS NULL
      OR (SELECT role FROM core.users WHERE id = auth.uid()) = ANY(visibility_roles)
    )
  );

CREATE POLICY "Service role has full access to knowledge documents"
  ON scout.knowledge_documents FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.knowledge_chunks
-- =====================================================================

CREATE POLICY "Users can view knowledge chunks in their tenant"
  ON scout.knowledge_chunks FOR SELECT
  USING (
    tenant_id = scout.get_user_tenant_id()
    AND document_id IN (
      SELECT id FROM scout.knowledge_documents
      WHERE tenant_id = scout.get_user_tenant_id()
      AND (
        visibility_roles IS NULL
        OR (SELECT role FROM core.users WHERE id = auth.uid()) = ANY(visibility_roles)
      )
    )
  );

CREATE POLICY "Service role has full access to knowledge chunks"
  ON scout.knowledge_chunks FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.ai_conversations
-- =====================================================================

CREATE POLICY "Users can view their own conversations"
  ON scout.ai_conversations FOR SELECT
  USING (
    tenant_id = scout.get_user_tenant_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can create their own conversations"
  ON scout.ai_conversations FOR INSERT
  WITH CHECK (
    tenant_id = scout.get_user_tenant_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own conversations"
  ON scout.ai_conversations FOR UPDATE
  USING (
    tenant_id = scout.get_user_tenant_id()
    AND user_id = auth.uid()
  );

CREATE POLICY "Service role has full access to conversations"
  ON scout.ai_conversations FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- POLICIES: scout.ai_messages
-- =====================================================================

CREATE POLICY "Users can view messages in their conversations"
  ON scout.ai_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM scout.ai_conversations
      WHERE user_id = auth.uid()
      AND tenant_id = scout.get_user_tenant_id()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON scout.ai_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM scout.ai_conversations
      WHERE user_id = auth.uid()
      AND tenant_id = scout.get_user_tenant_id()
    )
  );

CREATE POLICY "Service role has full access to messages"
  ON scout.ai_messages FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON POLICY "Users can view stores in their tenant" ON scout.stores IS 'Tenant isolation via RLS';
COMMENT ON POLICY "Users can view transactions in their tenant" ON scout.transactions IS 'Tenant isolation via RLS';
COMMENT ON POLICY "Users can view their own conversations" ON scout.ai_conversations IS 'Users only see their own AI chat sessions';

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
