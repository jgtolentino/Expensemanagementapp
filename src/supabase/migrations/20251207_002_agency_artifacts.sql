-- Migration: 20251207_002_agency_artifacts.sql
-- Description: Create artifacts, versions, and comments tables
-- Date: 2025-12-07

-- =============================================================================
-- 1. ARTIFACTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.artifacts (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  campaign_id uuid REFERENCES agency.campaigns(id),
  client_id uuid REFERENCES agency.clients(id),
  brand_id uuid REFERENCES agency.brands(id),
  phase_id uuid REFERENCES agency.campaign_phases(id),
  
  -- Identifiers
  artifact_code varchar(50) UNIQUE,
  title varchar(500) NOT NULL,
  
  -- Type
  artifact_type varchar(50) NOT NULL,
  sub_type varchar(50),
  format varchar(50),
  
  -- Content
  content text,
  content_url text,
  content_preview text,
  file_size_bytes bigint,
  mime_type varchar(100),
  
  -- Metadata
  description text,
  tags text[],
  icon varchar(50),
  
  -- Ownership & Workflow
  owner_id uuid,
  status varchar(50) DEFAULT 'draft',
  version integer DEFAULT 1,
  parent_artifact_id uuid REFERENCES agency.artifacts(id),
  
  -- Approval
  approver_id uuid,
  approved_at timestamptz,
  approval_notes text,
  
  -- Analytics
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  
  -- AI/RAG
  embedding_status varchar(50) DEFAULT 'pending',
  embedded_at timestamptz,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_artifact_type CHECK (artifact_type IN (
    'brief', 'script', 'deck', 'board', 'concept', 'storyboard', 'layout', 'key_visual', 'other'
  )),
  CONSTRAINT valid_artifact_status CHECK (status IN (
    'draft', 'review', 'approved', 'published', 'archived'
  )),
  CONSTRAINT valid_embedding_status CHECK (embedding_status IN (
    'pending', 'in_progress', 'completed', 'failed'
  ))
);

-- Indexes for artifacts
CREATE INDEX IF NOT EXISTS idx_artifacts_campaign ON agency.artifacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_client ON agency.artifacts(client_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_brand ON agency.artifacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_tenant ON agency.artifacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON agency.artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_status ON agency.artifacts(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_owner ON agency.artifacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_embedding_pending ON agency.artifacts(embedding_status) 
  WHERE embedding_status = 'pending';

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_artifacts_tags ON agency.artifacts USING gin(tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_artifacts_search ON agency.artifacts 
  USING gin(to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(content_preview, '') || ' ' || 
    coalesce(description, '')
  ));

-- Comments
COMMENT ON TABLE agency.artifacts IS 'Creative artifacts (briefs, scripts, decks, boards)';
COMMENT ON COLUMN agency.artifacts.content IS 'Text content for text-based artifacts (Markdown/HTML)';
COMMENT ON COLUMN agency.artifacts.content_url IS 'Supabase Storage URL for file-based artifacts';
COMMENT ON COLUMN agency.artifacts.embedding_status IS 'Status of AI embedding generation for RAG';

-- =============================================================================
-- 2. ARTIFACT VERSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.artifact_versions (
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
  changed_by uuid,
  change_summary text,
  
  -- Metadata
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_artifact_version UNIQUE (artifact_id, version_number)
);

-- Indexes for artifact_versions
CREATE INDEX IF NOT EXISTS idx_versions_artifact ON agency.artifact_versions(artifact_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_versions_tenant ON agency.artifact_versions(tenant_id);

-- Comments
COMMENT ON TABLE agency.artifact_versions IS 'Version history for artifacts';
COMMENT ON COLUMN agency.artifact_versions.change_summary IS 'Description of what changed in this version';

-- =============================================================================
-- 3. ARTIFACT COMMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency.artifact_comments (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  artifact_id uuid NOT NULL REFERENCES agency.artifacts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES agency.artifact_comments(id),
  
  -- Content
  comment_text text NOT NULL,
  
  -- Metadata
  commenter_id uuid NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_by uuid,
  resolved_at timestamptz,
  
  -- Audit
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for artifact_comments
CREATE INDEX IF NOT EXISTS idx_comments_artifact ON agency.artifact_comments(artifact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON agency.artifact_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_tenant ON agency.artifact_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comments_unresolved ON agency.artifact_comments(artifact_id) 
  WHERE is_resolved = false;

-- Comments
COMMENT ON TABLE agency.artifact_comments IS 'Threaded comments on artifacts';

-- =============================================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Trigger for artifacts
DROP TRIGGER IF EXISTS update_artifacts_updated_at ON agency.artifacts;
CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON agency.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- Trigger for artifact_comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON agency.artifact_comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON agency.artifact_comments
  FOR EACH ROW
  EXECUTE FUNCTION agency.update_updated_at_column();

-- =============================================================================
-- 5. AUTO-CREATE VERSION ON UPDATE
-- =============================================================================

CREATE OR REPLACE FUNCTION agency.create_artifact_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content OR 
     OLD.content_url IS DISTINCT FROM NEW.content_url OR
     OLD.title IS DISTINCT FROM NEW.title THEN
    
    INSERT INTO agency.artifact_versions (
      artifact_id,
      version_number,
      title,
      content,
      content_url,
      tags,
      status,
      changed_by,
      tenant_id
    ) VALUES (
      OLD.id,
      OLD.version,
      OLD.title,
      OLD.content,
      OLD.content_url,
      OLD.tags,
      OLD.status,
      NEW.updated_by,
      OLD.tenant_id
    );
    
    -- Increment version on the new row
    NEW.version = OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_artifact_version_trigger ON agency.artifacts;
CREATE TRIGGER create_artifact_version_trigger
  BEFORE UPDATE ON agency.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION agency.create_artifact_version();

-- =============================================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE agency.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.artifact_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency.artifact_comments ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Agency Artifacts Migration Complete';
  RAISE NOTICE 'Tables created: artifacts, artifact_versions, artifact_comments';
  RAISE NOTICE 'Indexes created: 15+ including GIN for tags and full-text search';
  RAISE NOTICE 'Triggers created: 3 (updated_at + auto-versioning)';
  RAISE NOTICE 'RLS enabled on all tables';
END $$;
