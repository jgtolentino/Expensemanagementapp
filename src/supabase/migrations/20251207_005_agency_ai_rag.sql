-- Migration: 20251207_005_agency_ai_rag.sql
-- Description: AI/RAG tables for knowledge documents and conversations
-- Date: 2025-12-07
-- Dependencies: Requires pgvector extension

-- =============================================================================
-- 1. ENABLE PGVECTOR EXTENSION
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- 2. KNOWLEDGE DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.knowledge_documents (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type & Source
  doc_type varchar(50) NOT NULL,
  source varchar(50) NOT NULL,
  source_id text,
  
  -- Content
  title varchar(500) NOT NULL,
  content text NOT NULL,
  content_preview text GENERATED ALWAYS AS (LEFT(content, 500)) STORED,
  
  -- Classification
  tags text[],
  client_id uuid REFERENCES agency.clients(id),
  category varchar(100),
  
  -- Embedding Status
  embedding_status varchar(50) DEFAULT 'pending',
  last_synced_at timestamptz,
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_doc_type CHECK (doc_type IN (
    'playbook', 'template', 'policy', 'sop', 'guide', 'faq', 'best_practice'
  )),
  CONSTRAINT valid_source CHECK (source IN (
    'notion', 'local', 'uploaded', 'generated'
  )),
  CONSTRAINT valid_embedding_status CHECK (embedding_status IN (
    'pending', 'in_progress', 'completed', 'failed'
  ))
);

-- Indexes for knowledge_documents
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_tenant ON agency.knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_type ON agency.knowledge_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_client ON agency.knowledge_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_tags ON agency.knowledge_documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_embedding_pending ON agency.knowledge_documents(embedding_status) 
  WHERE embedding_status = 'pending';

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_search ON agency.knowledge_documents 
  USING gin(to_tsvector('english', title || ' ' || content));

-- Comments
COMMENT ON TABLE agency.knowledge_documents IS 'Agency-specific knowledge base for RAG';
COMMENT ON COLUMN agency.knowledge_documents.source IS 'Origin: notion, local, uploaded, or AI-generated';

-- =============================================================================
-- 3. KNOWLEDGE CHUNKS TABLE (with embeddings)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.knowledge_chunks (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  document_id uuid NOT NULL REFERENCES agency.knowledge_documents(id) ON DELETE CASCADE,
  
  -- Chunk
  chunk_index integer NOT NULL,
  content text NOT NULL,
  
  -- Embedding (1536-dim for OpenAI text-embedding-ada-002)
  embedding vector(1536),
  
  -- Metadata
  metadata jsonb,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_document_chunk UNIQUE (document_id, chunk_index)
);

-- Indexes for knowledge_chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document ON agency.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_tenant ON agency.knowledge_chunks(tenant_id);

-- Vector index (HNSW for fast approximate nearest neighbor search)
-- Use HNSW for < 1M rows, IVFFlat for > 1M rows
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON agency.knowledge_chunks 
  USING hnsw (embedding vector_cosine_ops);

-- Comments
COMMENT ON TABLE agency.knowledge_chunks IS 'Chunked + embedded knowledge for vector search';
COMMENT ON COLUMN agency.knowledge_chunks.embedding IS '1536-dimensional vector from OpenAI ada-002';

-- =============================================================================
-- 4. AI CONVERSATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.ai_conversations (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id uuid NOT NULL,
  user_role varchar(50),
  
  -- Context
  context_type varchar(50),
  context_id uuid,
  
  -- Metadata
  conversation_title varchar(500),
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_context_type CHECK (context_type IN (
    'campaign', 'artifact', 'client', 'dashboard', 'general'
  ))
);

-- Indexes for ai_conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON agency.ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_context ON agency.ai_conversations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tenant ON agency.ai_conversations(tenant_id);

-- Comments
COMMENT ON TABLE agency.ai_conversations IS 'AI assistant chat sessions';
COMMENT ON COLUMN agency.ai_conversations.context_type IS 'What entity the conversation is about';

-- =============================================================================
-- 5. AI MESSAGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.ai_messages (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  conversation_id uuid NOT NULL REFERENCES agency.ai_conversations(id) ON DELETE CASCADE,
  
  -- Message
  role varchar(50) NOT NULL,
  content text NOT NULL,
  
  -- Sources (for RAG citations)
  sources jsonb,
  
  -- Metadata
  model varchar(100),
  tokens_used integer,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_message_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- Indexes for ai_messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON agency.ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_tenant ON agency.ai_messages(tenant_id);

-- Comments
COMMENT ON TABLE agency.ai_messages IS 'Individual messages in AI conversations';
COMMENT ON COLUMN agency.ai_messages.sources IS 'JSON array of RAG sources cited in response';

-- =============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =============================================================================

DROP TRIGGER IF EXISTS update_knowledge_docs_updated_at ON agency.knowledge_documents;
CREATE TRIGGER update_knowledge_docs_updated_at
  BEFORE UPDATE ON agency.knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON agency.ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON agency.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- =============================================================================
-- 7. VECTOR SEARCH FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION agency.search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  filter_client_id uuid DEFAULT NULL,
  filter_tags text[] DEFAULT NULL
)
RETURNS TABLE (
  document_id uuid,
  chunk_id uuid,
  title varchar,
  content text,
  similarity float,
  doc_type varchar,
  tags text[],
  metadata jsonb
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kd.id AS document_id,
    kc.id AS chunk_id,
    kd.title,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kd.doc_type,
    kd.tags,
    kc.metadata
  FROM agency.knowledge_chunks kc
  JOIN agency.knowledge_documents kd ON kd.id = kc.document_id
  WHERE 
    kd.embedding_status = 'completed'
    AND (1 - (kc.embedding <=> query_embedding)) > match_threshold
    AND (filter_client_id IS NULL OR kd.client_id = filter_client_id)
    AND (filter_tags IS NULL OR kd.tags && filter_tags)
    AND kd.tenant_id = current_setting('app.current_tenant', true)::uuid
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION agency.search_knowledge IS 'Vector similarity search over knowledge base';

-- =============================================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE agency.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.ai_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Agency AI/RAG Migration Complete';
  RAISE NOTICE 'Tables created: knowledge_documents, knowledge_chunks, ai_conversations, ai_messages';
  RAISE NOTICE 'Vector extension enabled: pgvector';
  RAISE NOTICE 'Vector index created: HNSW on knowledge_chunks.embedding';
  RAISE NOTICE 'Functions created: search_knowledge';
  RAISE NOTICE 'RLS enabled on all tables';
END $$;
