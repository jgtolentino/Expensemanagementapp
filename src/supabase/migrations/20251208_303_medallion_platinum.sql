-- =====================================================================
-- Medallion Architecture - Migration 4: Platinum Layer (AI-Ready Data)
-- =====================================================================
-- Purpose: Create platinum schema for AI/ML-ready data with embeddings
-- Dependencies: gold schema
-- Author: IPAI Scout - MCP Marketplace
-- Date: 2025-12-08
-- =====================================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS platinum;

-- Grant usage
GRANT USAGE ON SCHEMA platinum TO authenticated;
GRANT ALL ON SCHEMA platinum TO service_role;

-- Enable vector extension if available
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================================
-- PLATINUM LAYER: AI/ML-Ready Data
-- =====================================================================

-- ---------------------------------------------------------------------
-- Platinum: Document Embeddings for RAG
-- Vector embeddings for semantic search across documents
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platinum.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Source Reference
  source_type TEXT NOT NULL,  -- 'expense', 'receipt', 'policy', 'bir_form'
  source_id UUID,
  source_url TEXT,

  -- Document Content
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT,  -- For deduplication

  -- Chunking Info
  chunk_index INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 1,
  parent_id UUID,  -- Link to parent document if chunked

  -- Embeddings
  embedding vector(1536),  -- OpenAI ada-002 dimension
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  embedding_version INTEGER DEFAULT 1,

  -- Metadata
  metadata JSONB,
  language TEXT DEFAULT 'en',
  word_count INTEGER,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_embedded_at TIMESTAMPTZ
);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_platinum_embeddings_vector
  ON platinum.document_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_platinum_embeddings_tenant ON platinum.document_embeddings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platinum_embeddings_source ON platinum.document_embeddings(source_type, source_id);

-- ---------------------------------------------------------------------
-- Platinum: NL2SQL Query Cache
-- Cache for natural language to SQL queries (GenieView)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platinum.nl2sql_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Query
  natural_query TEXT NOT NULL,
  query_hash TEXT NOT NULL,  -- For exact match lookup
  query_embedding vector(1536),  -- For semantic similarity

  -- Generated SQL
  generated_sql TEXT NOT NULL,
  sql_explanation TEXT,

  -- Execution Results
  last_result_summary JSONB,
  result_row_count INTEGER,
  execution_time_ms INTEGER,

  -- Quality Metrics
  confidence_score NUMERIC(3, 2),  -- 0.00 to 1.00
  was_validated BOOLEAN DEFAULT FALSE,
  validation_feedback TEXT,
  usage_count INTEGER DEFAULT 1,

  -- Model Info
  model_used TEXT,
  model_version TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platinum_nl2sql_tenant ON platinum.nl2sql_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platinum_nl2sql_hash ON platinum.nl2sql_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_platinum_nl2sql_vector
  ON platinum.nl2sql_cache
  USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 50);

-- ---------------------------------------------------------------------
-- Platinum: Expense Category Predictions
-- ML predictions for expense categorization
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platinum.expense_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  expense_id UUID,  -- Link to silver.validated_expenses

  -- Input Features
  merchant_text TEXT,
  description_text TEXT,
  amount NUMERIC(15, 2),
  input_embedding vector(1536),

  -- Predictions
  predicted_category TEXT,
  prediction_confidence NUMERIC(3, 2),
  alternative_categories JSONB,  -- [{category, confidence}, ...]

  -- BIR Tax Predictions
  predicted_bir_category TEXT,
  predicted_is_deductible BOOLEAN,
  tax_prediction_confidence NUMERIC(3, 2),

  -- Model Info
  model_id TEXT,
  model_version TEXT,

  -- Feedback Loop
  actual_category TEXT,
  was_correct BOOLEAN,
  user_feedback TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  feedback_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_platinum_predictions_tenant ON platinum.expense_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platinum_predictions_expense ON platinum.expense_predictions(expense_id);
CREATE INDEX IF NOT EXISTS idx_platinum_predictions_vector
  ON platinum.expense_predictions
  USING ivfflat (input_embedding vector_cosine_ops)
  WITH (lists = 100);

-- ---------------------------------------------------------------------
-- Platinum: MCP Capability Embeddings
-- Semantic search over MCP capabilities
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platinum.mcp_capability_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- MCP Reference
  product_id TEXT NOT NULL,
  product_name TEXT,
  capability_id TEXT NOT NULL,
  capability_name TEXT NOT NULL,

  -- Content for Embedding
  capability_description TEXT NOT NULL,
  capability_type TEXT,  -- 'tool', 'resource', 'prompt'
  example_usage TEXT,

  -- Embedding
  embedding vector(1536),
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',

  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  avg_rating NUMERIC(3, 2),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platinum_mcp_cap_product ON platinum.mcp_capability_embeddings(product_id);
CREATE INDEX IF NOT EXISTS idx_platinum_mcp_cap_vector
  ON platinum.mcp_capability_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- ---------------------------------------------------------------------
-- Platinum: Agent Memory (for stateful agents)
-- Persistent memory for AI agents
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platinum.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Agent Info
  agent_type TEXT NOT NULL,
  session_id UUID,
  user_id UUID,

  -- Memory Content
  memory_type TEXT NOT NULL,  -- 'short_term', 'long_term', 'episodic'
  memory_key TEXT,
  memory_content JSONB NOT NULL,
  content_embedding vector(1536),

  -- Importance & Recency
  importance_score NUMERIC(3, 2) DEFAULT 0.5,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  -- TTL
  expires_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platinum_memory_tenant ON platinum.agent_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platinum_memory_agent ON platinum.agent_memory(agent_type, session_id);
CREATE INDEX IF NOT EXISTS idx_platinum_memory_vector
  ON platinum.agent_memory
  USING ivfflat (content_embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_platinum_memory_expires ON platinum.agent_memory(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================================
-- FUNCTIONS for Vector Search
-- =====================================================================

-- Semantic search for documents
CREATE OR REPLACE FUNCTION platinum.search_documents(
  p_tenant_id UUID,
  p_query_embedding vector(1536),
  p_source_types TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_similarity_threshold NUMERIC DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.source_type,
    de.source_id,
    de.title,
    de.content,
    de.metadata,
    1 - (de.embedding <=> p_query_embedding) as similarity
  FROM platinum.document_embeddings de
  WHERE de.tenant_id = p_tenant_id
    AND (p_source_types IS NULL OR de.source_type = ANY(p_source_types))
    AND 1 - (de.embedding <=> p_query_embedding) >= p_similarity_threshold
  ORDER BY de.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Semantic search for MCP capabilities
CREATE OR REPLACE FUNCTION platinum.search_mcp_capabilities(
  p_query_embedding vector(1536),
  p_capability_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_id TEXT,
  product_name TEXT,
  capability_id TEXT,
  capability_name TEXT,
  capability_description TEXT,
  capability_type TEXT,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mce.product_id,
    mce.product_name,
    mce.capability_id,
    mce.capability_name,
    mce.capability_description,
    mce.capability_type,
    1 - (mce.embedding <=> p_query_embedding) as similarity
  FROM platinum.mcp_capability_embeddings mce
  WHERE (p_capability_type IS NULL OR mce.capability_type = p_capability_type)
  ORDER BY mce.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Find similar cached NL2SQL queries
CREATE OR REPLACE FUNCTION platinum.find_similar_queries(
  p_tenant_id UUID,
  p_query_embedding vector(1536),
  p_similarity_threshold NUMERIC DEFAULT 0.85,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  natural_query TEXT,
  generated_sql TEXT,
  sql_explanation TEXT,
  confidence_score NUMERIC,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nc.id,
    nc.natural_query,
    nc.generated_sql,
    nc.sql_explanation,
    nc.confidence_score,
    1 - (nc.query_embedding <=> p_query_embedding) as similarity
  FROM platinum.nl2sql_cache nc
  WHERE nc.tenant_id = p_tenant_id
    AND 1 - (nc.query_embedding <=> p_query_embedding) >= p_similarity_threshold
  ORDER BY nc.query_embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

ALTER TABLE platinum.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platinum.nl2sql_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE platinum.expense_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platinum.agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_docs ON platinum.document_embeddings
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_nl2sql ON platinum.nl2sql_cache
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_predictions ON platinum.expense_predictions
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_memory ON platinum.agent_memory
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- MCP capabilities are global (no tenant isolation)
-- platinum.mcp_capability_embeddings does not have RLS

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA platinum TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA platinum TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA platinum TO authenticated;

COMMENT ON SCHEMA platinum IS 'Platinum layer: AI/ML-ready data with vector embeddings for RAG and semantic search';
