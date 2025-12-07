-- =====================================================================
-- Finance PPM: AI/RAG Schema
-- Migration: 20251207_105_ppm_ai_rag.sql
-- Description: Create AI/RAG tables with pgvector for knowledge base
-- Dependencies: 20251207_101_ppm_engagements_projects.sql
-- =====================================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================================
-- Table: finance_ppm.knowledge_documents
-- Purpose: Source documents for RAG (Notion pages, local docs, policies)
-- Grain: One row per source document
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.knowledge_documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Source
  source_type       text NOT NULL CHECK (source_type IN ('notion','local','policy','sop','view_doc','faq')),
  source_id         text,  -- External ID (e.g. Notion page ID)
  source_url        text,
  
  -- Document metadata
  title             text NOT NULL,
  content           text NOT NULL,
  
  -- Classification
  category          text,  -- e.g. 'finance', 'legal', 'hr', 'sales', 'operations'
  tags              text[],
  
  -- Access control
  visibility        text CHECK (visibility IN ('public','internal','finance_only','partner_only')) DEFAULT 'internal',
  
  -- Sync tracking (for Notion)
  last_synced_at    timestamptz,
  sync_status       text CHECK (sync_status IN ('active','paused','error')),
  sync_error        text,
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes for finance_ppm.knowledge_documents
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_documents_tenant ON finance_ppm.knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_documents_source ON finance_ppm.knowledge_documents(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_documents_category ON finance_ppm.knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_documents_visibility ON finance_ppm.knowledge_documents(visibility);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_documents_sync_status ON finance_ppm.knowledge_documents(sync_status) WHERE source_type = 'notion';

COMMENT ON TABLE finance_ppm.knowledge_documents IS 'Source documents for AI RAG (Notion pages, local docs, policies, SOPs)';
COMMENT ON COLUMN finance_ppm.knowledge_documents.source_type IS 'Document source: notion, local, policy, sop, view_doc, faq';
COMMENT ON COLUMN finance_ppm.knowledge_documents.visibility IS 'Access level: public, internal, finance_only, partner_only';
COMMENT ON COLUMN finance_ppm.knowledge_documents.sync_status IS 'Notion sync status: active, paused, error';

-- =====================================================================
-- Table: finance_ppm.knowledge_chunks
-- Purpose: Chunked text with vector embeddings for RAG search (pgvector)
-- Grain: One row per chunk
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.knowledge_chunks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  document_id       uuid NOT NULL REFERENCES finance_ppm.knowledge_documents(id) ON DELETE CASCADE,
  
  -- Chunk content
  chunk_text        text NOT NULL,
  chunk_index       int NOT NULL,  -- Position in document (0-based)
  
  -- Embedding (OpenAI ada-002: 1536 dimensions)
  embedding         vector(1536),
  
  -- Metadata for filtering (JSON)
  metadata          jsonb DEFAULT '{}'::jsonb,
  /*
    Metadata structure:
    {
      "client_id": "uuid",
      "engagement_id": "uuid",
      "project_id": "uuid",
      "role_access": ["partner", "finance_director", "account_manager"],
      "category": "finance",
      "keywords": ["budget", "invoice", "ar"]
    }
  */
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(document_id, chunk_index)
);

-- Indexes for finance_ppm.knowledge_chunks
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_chunks_tenant ON finance_ppm.knowledge_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_chunks_document ON finance_ppm.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_chunks_metadata ON finance_ppm.knowledge_chunks USING gin(metadata);

-- pgvector index for similarity search (ivfflat with 100 lists)
-- This is the key index for RAG vector search
CREATE INDEX IF NOT EXISTS idx_finance_ppm_knowledge_chunks_embedding 
ON finance_ppm.knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

COMMENT ON TABLE finance_ppm.knowledge_chunks IS 'Chunked text with vector embeddings for RAG similarity search (pgvector)';
COMMENT ON COLUMN finance_ppm.knowledge_chunks.embedding IS 'OpenAI ada-002 embedding (1536 dimensions)';
COMMENT ON COLUMN finance_ppm.knowledge_chunks.metadata IS 'JSON metadata for filtering (client_id, role_access, keywords, etc.)';

-- =====================================================================
-- Table: finance_ppm.ai_sessions
-- Purpose: AI chat session metadata
-- Grain: One row per chat session
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.ai_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  user_id           uuid NOT NULL,  -- FK to core.users
  
  -- Session metadata
  title             text,  -- Auto-generated from first message
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes for finance_ppm.ai_sessions
CREATE INDEX IF NOT EXISTS idx_finance_ppm_ai_sessions_tenant ON finance_ppm.ai_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_ai_sessions_user ON finance_ppm.ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_ai_sessions_created ON finance_ppm.ai_sessions(created_at DESC);

COMMENT ON TABLE finance_ppm.ai_sessions IS 'AI chat session metadata (one per conversation)';

-- =====================================================================
-- Table: finance_ppm.ai_messages
-- Purpose: AI chat message history
-- Grain: One row per message (user or assistant)
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.ai_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid NOT NULL REFERENCES finance_ppm.ai_sessions(id) ON DELETE CASCADE,
  
  -- Message
  role              text NOT NULL CHECK (role IN ('user','assistant','system')),
  content           text NOT NULL,
  
  -- Sources (for assistant messages - array of source references)
  sources           jsonb DEFAULT '[]'::jsonb,
  /*
    Sources structure:
    [
      {
        "type": "document",
        "id": "uuid",
        "title": "Month-End Close SOP",
        "excerpt": "..."
      },
      {
        "type": "data",
        "view": "v_project_profitability",
        "query": "SELECT ...",
        "result_count": 5
      }
    ]
  */
  
  -- Data (for assistant messages with structured data - tables, charts)
  data              jsonb,
  /*
    Data structure:
    {
      "type": "table",
      "columns": ["Project", "Revenue", "Margin %"],
      "rows": [...]
    }
    OR
    {
      "type": "chart",
      "chart_type": "bar",
      "data": [...]
    }
  */
  
  -- Tool calls (if assistant used tools)
  tool_calls        jsonb,
  /*
    Tool calls structure:
    [
      {
        "tool": "get_project_profitability",
        "params": { "project_id": "uuid" },
        "result": { ... }
      }
    ]
  */
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes for finance_ppm.ai_messages
CREATE INDEX IF NOT EXISTS idx_finance_ppm_ai_messages_session ON finance_ppm.ai_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_ai_messages_created ON finance_ppm.ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_ai_messages_role ON finance_ppm.ai_messages(role);

COMMENT ON TABLE finance_ppm.ai_messages IS 'AI chat message history (user and assistant messages)';
COMMENT ON COLUMN finance_ppm.ai_messages.sources IS 'JSON array of source references (documents + data views)';
COMMENT ON COLUMN finance_ppm.ai_messages.data IS 'JSON structured data (tables, charts) returned by assistant';
COMMENT ON COLUMN finance_ppm.ai_messages.tool_calls IS 'JSON array of tool calls made by assistant';

-- =====================================================================
-- Triggers: Auto-update timestamps
-- =====================================================================

DROP TRIGGER IF EXISTS update_finance_ppm_knowledge_documents_updated_at ON finance_ppm.knowledge_documents;
CREATE TRIGGER update_finance_ppm_knowledge_documents_updated_at
  BEFORE UPDATE ON finance_ppm.knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_ppm_ai_sessions_updated_at ON finance_ppm.ai_sessions;
CREATE TRIGGER update_finance_ppm_ai_sessions_updated_at
  BEFORE UPDATE ON finance_ppm.ai_sessions
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- =====================================================================
-- Trigger: Auto-generate session title from first user message
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.generate_session_title()
RETURNS TRIGGER AS $$
DECLARE
  v_session_title text;
BEGIN
  -- Only for first user message in session
  IF NEW.role = 'user' AND NOT EXISTS (
    SELECT 1 FROM finance_ppm.ai_messages 
    WHERE session_id = NEW.session_id 
    AND id != NEW.id
  ) THEN
    -- Take first 50 characters of message as title
    v_session_title := LEFT(NEW.content, 50);
    IF LENGTH(NEW.content) > 50 THEN
      v_session_title := v_session_title || '...';
    END IF;
    
    -- Update session title
    UPDATE finance_ppm.ai_sessions
    SET title = v_session_title
    WHERE id = NEW.session_id AND title IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_session_title_on_first_message ON finance_ppm.ai_messages;
CREATE TRIGGER generate_session_title_on_first_message
  AFTER INSERT ON finance_ppm.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.generate_session_title();

-- =====================================================================
-- Function: Vector similarity search (RAG query)
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.search_knowledge(
  p_tenant_id uuid,
  p_query_embedding vector(1536),
  p_limit int DEFAULT 5,
  p_role text DEFAULT NULL,
  p_category text DEFAULT NULL
) RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  document_title text,
  chunk_text text,
  similarity numeric,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kc.id AS chunk_id,
    kc.document_id,
    kd.title AS document_title,
    kc.chunk_text,
    (1 - (kc.embedding <=> p_query_embedding))::numeric AS similarity,
    kc.metadata
  FROM finance_ppm.knowledge_chunks kc
  JOIN finance_ppm.knowledge_documents kd ON kc.document_id = kd.id
  WHERE kc.tenant_id = p_tenant_id
    -- Role-based filtering
    AND (
      p_role IS NULL 
      OR kd.visibility = 'public'
      OR (kd.visibility = 'internal' AND p_role IS NOT NULL)
      OR (kd.visibility = 'finance_only' AND p_role IN ('partner', 'finance_director', 'staff_accountant'))
      OR (kd.visibility = 'partner_only' AND p_role = 'partner')
      OR (kc.metadata->'role_access' @> to_jsonb(p_role))
    )
    -- Category filtering
    AND (p_category IS NULL OR kd.category = p_category)
  ORDER BY kc.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION finance_ppm.search_knowledge IS 'Vector similarity search with role-based access control (RAG query)';

-- =====================================================================
-- Function: Chunk text for embedding
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.chunk_document_text(
  p_text text,
  p_chunk_size int DEFAULT 1000,
  p_overlap int DEFAULT 100
) RETURNS TABLE (
  chunk_index int,
  chunk_text text
) AS $$
DECLARE
  v_text_length int;
  v_start_pos int;
  v_chunk_idx int := 0;
  v_chunk text;
BEGIN
  v_text_length := LENGTH(p_text);
  v_start_pos := 1;
  
  WHILE v_start_pos <= v_text_length LOOP
    -- Extract chunk
    v_chunk := SUBSTRING(p_text FROM v_start_pos FOR p_chunk_size);
    
    -- Return chunk
    RETURN QUERY SELECT v_chunk_idx, v_chunk;
    
    -- Move to next chunk with overlap
    v_start_pos := v_start_pos + p_chunk_size - p_overlap;
    v_chunk_idx := v_chunk_idx + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION finance_ppm.chunk_document_text IS 'Chunk long text into overlapping segments for embedding (default: 1000 chars, 100 overlap)';

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM AI/RAG migration complete:';
  RAISE NOTICE '  - Extension: vector (pgvector) enabled';
  RAISE NOTICE '  - Tables: knowledge_documents, knowledge_chunks, ai_sessions, ai_messages (4 tables)';
  RAISE NOTICE '  - Indexes: 13 indexes created';
  RAISE NOTICE '  - Vector index: ivfflat on knowledge_chunks.embedding (1536 dims, 100 lists)';
  RAISE NOTICE '  - Triggers:';
  RAISE NOTICE '    • update_updated_at (2 tables)';
  RAISE NOTICE '    • generate_session_title (auto-title from first message)';
  RAISE NOTICE '  - Functions:';
  RAISE NOTICE '    • search_knowledge (vector similarity search with RBAC)';
  RAISE NOTICE '    • chunk_document_text (text chunking for embeddings)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_106_ppm_analytics_views.sql';
END $$;
