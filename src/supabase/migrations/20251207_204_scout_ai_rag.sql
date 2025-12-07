-- =====================================================================
-- Scout Dashboard - Migration 5: AI / RAG Tables
-- =====================================================================
-- Purpose: Create AI recommendations, knowledge base, and chat tables
-- Dependencies: 20251207_203_scout_analytics_views.sql, pgvector extension
-- Author: TBWA Agency Databank
-- Date: 2025-12-07
-- =====================================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================================
-- TABLE: scout.recommendations (SariCoach AI)
-- =====================================================================

CREATE TABLE scout.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES scout.transactions(id),
  store_id uuid NOT NULL REFERENCES scout.stores(id),
  customer_id uuid REFERENCES scout.customers(id),
  
  -- Recommendation Details
  recommendation_type scout.recommendation_type_enum NOT NULL,
  recommended_product_id uuid NOT NULL REFERENCES scout.products(id),
  reason text NOT NULL,
  confidence_score numeric(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Context
  context_basket_id uuid,
  context_category scout.product_category_enum,
  context_time_of_day scout.time_of_day_enum NOT NULL,
  
  -- Outcome
  accepted boolean,
  accepted_at timestamptz,
  rejection_reason text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_recommendations_tenant ON scout.recommendations(tenant_id);
CREATE INDEX idx_recommendations_transaction ON scout.recommendations(transaction_id);
CREATE INDEX idx_recommendations_store ON scout.recommendations(store_id);
CREATE INDEX idx_recommendations_customer ON scout.recommendations(customer_id);
CREATE INDEX idx_recommendations_type ON scout.recommendations(recommendation_type);
CREATE INDEX idx_recommendations_accepted ON scout.recommendations(accepted);
CREATE INDEX idx_recommendations_created ON scout.recommendations(created_at DESC);

-- Comments
COMMENT ON TABLE scout.recommendations IS 'SariCoach AI recommendations with acceptance tracking';
COMMENT ON COLUMN scout.recommendations.confidence_score IS 'AI confidence (0-1)';

-- =====================================================================
-- TABLE: scout.knowledge_documents
-- =====================================================================

CREATE TABLE scout.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  title varchar(500) NOT NULL,
  category varchar(100),  -- 'product_guide', 'market_report', 'best_practices', 'case_study'
  content_type varchar(50),  -- 'pdf', 'text', 'markdown'
  content text NOT NULL,
  metadata jsonb,
  visibility_roles text[],  -- Which roles can access
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_documents_tenant ON scout.knowledge_documents(tenant_id);
CREATE INDEX idx_knowledge_documents_category ON scout.knowledge_documents(category);
CREATE INDEX idx_knowledge_documents_title ON scout.knowledge_documents USING gin(to_tsvector('english', title));

-- Comments
COMMENT ON TABLE scout.knowledge_documents IS 'Knowledge base documents for RAG';

-- =====================================================================
-- TABLE: scout.knowledge_chunks (pgvector)
-- =====================================================================

CREATE TABLE scout.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES scout.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  chunk_text text NOT NULL,
  embedding vector(1536),  -- OpenAI ada-002 embeddings
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_chunks_tenant ON scout.knowledge_chunks(tenant_id);
CREATE INDEX idx_knowledge_chunks_document ON scout.knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_chunks_embedding ON scout.knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Comments
COMMENT ON TABLE scout.knowledge_chunks IS 'Vector embeddings for semantic search (OpenAI ada-002, 1536 dims)';
COMMENT ON COLUMN scout.knowledge_chunks.embedding IS 'OpenAI ada-002 embedding vector';

-- =====================================================================
-- TABLE: scout.ai_conversations
-- =====================================================================

CREATE TABLE scout.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES core.users(id),
  title varchar(500),  -- Auto-generated from first query
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_conversations_tenant ON scout.ai_conversations(tenant_id);
CREATE INDEX idx_ai_conversations_user ON scout.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created ON scout.ai_conversations(created_at DESC);

-- Comments
COMMENT ON TABLE scout.ai_conversations IS 'AI chat sessions for "Ask Suqi"';

-- =====================================================================
-- TABLE: scout.ai_messages
-- =====================================================================

CREATE TABLE scout.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES scout.ai_conversations(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content text NOT NULL,
  sources jsonb,  -- Array of source citations
  tool_calls jsonb,  -- Array of tool executions
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_messages_conversation ON scout.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON scout.ai_messages(created_at DESC);
CREATE INDEX idx_ai_messages_role ON scout.ai_messages(role);

-- Comments
COMMENT ON TABLE scout.ai_messages IS 'AI chat message history';
COMMENT ON COLUMN scout.ai_messages.sources IS 'JSON array of RAG source citations';
COMMENT ON COLUMN scout.ai_messages.tool_calls IS 'JSON array of tool executions';

-- =====================================================================
-- FUNCTION: scout.search_knowledge
-- =====================================================================

CREATE OR REPLACE FUNCTION scout.search_knowledge(
  p_tenant_id uuid,
  p_query_embedding vector(1536),
  p_limit int DEFAULT 5,
  p_role text DEFAULT NULL,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  document_title varchar(500),
  chunk_text text,
  similarity numeric,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id as chunk_id,
    kc.document_id,
    kd.title as document_title,
    kc.chunk_text,
    (1 - (kc.embedding <=> p_query_embedding))::numeric as similarity,
    kc.metadata
  FROM scout.knowledge_chunks kc
  JOIN scout.knowledge_documents kd ON kc.document_id = kd.id
  WHERE kc.tenant_id = p_tenant_id
    AND (p_category IS NULL OR kd.category = p_category)
    AND (p_role IS NULL OR p_role = ANY(kd.visibility_roles) OR kd.visibility_roles IS NULL)
  ORDER BY kc.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION scout.search_knowledge TO authenticated;

COMMENT ON FUNCTION scout.search_knowledge IS 'Vector similarity search with role-based filtering';

-- =====================================================================
-- TRIGGERS (Updated At)
-- =====================================================================

CREATE OR REPLACE FUNCTION scout.update_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recommendations_updated_at
  BEFORE UPDATE ON scout.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_recommendations_updated_at();

CREATE OR REPLACE FUNCTION scout.update_knowledge_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_documents_updated_at
  BEFORE UPDATE ON scout.knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_knowledge_documents_updated_at();

CREATE OR REPLACE FUNCTION scout.update_ai_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ai_conversations_updated_at
  BEFORE UPDATE ON scout.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_ai_conversations_updated_at();

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT ON scout.recommendations TO authenticated;
GRANT SELECT ON scout.knowledge_documents TO authenticated;
GRANT SELECT ON scout.knowledge_chunks TO authenticated;
GRANT SELECT, INSERT ON scout.ai_conversations TO authenticated;
GRANT SELECT, INSERT ON scout.ai_messages TO authenticated;

GRANT ALL ON scout.recommendations TO service_role;
GRANT ALL ON scout.knowledge_documents TO service_role;
GRANT ALL ON scout.knowledge_chunks TO service_role;
GRANT ALL ON scout.ai_conversations TO service_role;
GRANT ALL ON scout.ai_messages TO service_role;

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
