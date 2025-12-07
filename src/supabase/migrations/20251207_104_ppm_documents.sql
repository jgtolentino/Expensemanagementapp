-- =====================================================================
-- Finance PPM: Documents Schema
-- Migration: 20251207_104_ppm_documents.sql
-- Description: Create document management tables for engagements
-- Dependencies: 20251207_101_ppm_engagements_projects.sql
-- =====================================================================

-- =====================================================================
-- Table: finance_ppm.documents
-- Purpose: Engagement-level document metadata (SOWs, contracts, reports)
-- Grain: One row per document (current version)
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  
  -- Link to engagement
  engagement_id     uuid NOT NULL REFERENCES finance_ppm.engagements(id) ON DELETE CASCADE,
  
  -- Document metadata
  filename          text NOT NULL,
  document_type     text CHECK (document_type IN ('contract','sow','po','report','deliverable','other')),
  title             text,
  
  -- File info
  file_size         bigint,  -- bytes
  mime_type         text,
  storage_url       text NOT NULL,  -- Supabase Storage path
  
  -- Status
  status            text CHECK (status IN ('draft','final','signed','archived')) DEFAULT 'draft',
  
  -- eSign (future integration)
  signature_status  text CHECK (signature_status IN ('not_required','pending','signed','declined')),
  signed_date       date,
  signed_by         text,  -- Signatory name
  
  -- Version
  version_number    int NOT NULL DEFAULT 1,
  is_current        boolean NOT NULL DEFAULT true,
  
  -- Ownership
  uploaded_by       uuid NOT NULL,  -- FK to core.users
  uploaded_at       timestamptz NOT NULL DEFAULT now(),
  
  -- Tracking
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  tags              text[],
  notes             text
);

-- Indexes for finance_ppm.documents
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_tenant ON finance_ppm.documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_engagement ON finance_ppm.documents(engagement_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_type ON finance_ppm.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_status ON finance_ppm.documents(status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_current ON finance_ppm.documents(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_signature_status ON finance_ppm.documents(signature_status);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_documents_uploaded_at ON finance_ppm.documents(uploaded_at DESC);

COMMENT ON TABLE finance_ppm.documents IS 'Engagement-level documents (SOWs, contracts, reports, deliverables)';
COMMENT ON COLUMN finance_ppm.documents.document_type IS 'Document type: contract, sow, po, report, deliverable, other';
COMMENT ON COLUMN finance_ppm.documents.storage_url IS 'Supabase Storage path (e.g., documents/{engagement_id}/{filename})';
COMMENT ON COLUMN finance_ppm.documents.signature_status IS 'eSign status: not_required, pending, signed, declined';
COMMENT ON COLUMN finance_ppm.documents.is_current IS 'True for latest version, false for historical versions';

-- =====================================================================
-- Table: finance_ppm.document_versions
-- Purpose: Version history for documents
-- Grain: One row per document version
-- =====================================================================

CREATE TABLE IF NOT EXISTS finance_ppm.document_versions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  document_id       uuid NOT NULL REFERENCES finance_ppm.documents(id) ON DELETE CASCADE,
  
  -- Version info
  version_number    int NOT NULL,
  storage_url       text NOT NULL,
  file_size         bigint,
  
  -- Upload
  uploaded_by       uuid NOT NULL,  -- FK to core.users
  uploaded_at       timestamptz NOT NULL DEFAULT now(),
  
  -- Metadata
  change_notes      text,
  
  UNIQUE(document_id, version_number)
);

-- Indexes for finance_ppm.document_versions
CREATE INDEX IF NOT EXISTS idx_finance_ppm_document_versions_tenant ON finance_ppm.document_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_document_versions_document ON finance_ppm.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_finance_ppm_document_versions_uploaded_at ON finance_ppm.document_versions(uploaded_at DESC);

COMMENT ON TABLE finance_ppm.document_versions IS 'Version history for documents (allows rollback to previous versions)';
COMMENT ON COLUMN finance_ppm.document_versions.change_notes IS 'Description of changes in this version';

-- =====================================================================
-- Triggers: Auto-update updated_at
-- =====================================================================

DROP TRIGGER IF EXISTS update_finance_ppm_documents_updated_at ON finance_ppm.documents;
CREATE TRIGGER update_finance_ppm_documents_updated_at
  BEFORE UPDATE ON finance_ppm.documents
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.update_updated_at_column();

-- =====================================================================
-- Trigger: Auto-create version history when document is replaced
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- When storage_url changes (document replaced), create version history
  IF OLD.storage_url IS DISTINCT FROM NEW.storage_url THEN
    -- Insert old version into document_versions
    INSERT INTO finance_ppm.document_versions (
      tenant_id,
      document_id,
      version_number,
      storage_url,
      file_size,
      uploaded_by,
      uploaded_at,
      change_notes
    ) VALUES (
      OLD.tenant_id,
      OLD.id,
      OLD.version_number,
      OLD.storage_url,
      OLD.file_size,
      OLD.uploaded_by,
      OLD.uploaded_at,
      'Replaced by version ' || NEW.version_number
    )
    ON CONFLICT (document_id, version_number) DO NOTHING;
    
    -- Increment version number
    NEW.version_number := OLD.version_number + 1;
    NEW.uploaded_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_document_version_on_replace ON finance_ppm.documents;
CREATE TRIGGER create_document_version_on_replace
  BEFORE UPDATE OF storage_url ON finance_ppm.documents
  FOR EACH ROW
  EXECUTE FUNCTION finance_ppm.create_document_version();

-- =====================================================================
-- Helper Function: Get documents by engagement
-- =====================================================================

CREATE OR REPLACE FUNCTION finance_ppm.get_engagement_documents(
  p_engagement_id uuid,
  p_document_type text DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  filename text,
  document_type text,
  status text,
  file_size bigint,
  version_number int,
  uploaded_by uuid,
  uploaded_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.filename,
    d.document_type,
    d.status,
    d.file_size,
    d.version_number,
    d.uploaded_by,
    d.uploaded_at
  FROM finance_ppm.documents d
  WHERE d.engagement_id = p_engagement_id
    AND d.is_current = true
    AND (p_document_type IS NULL OR d.document_type = p_document_type)
  ORDER BY d.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION finance_ppm.get_engagement_documents IS 'Get all current documents for an engagement, optionally filtered by type';

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM Documents migration complete:';
  RAISE NOTICE '  - Tables: finance_ppm.documents, finance_ppm.document_versions (2 tables)';
  RAISE NOTICE '  - Indexes: 11 indexes created';
  RAISE NOTICE '  - Triggers:';
  RAISE NOTICE '    • update_updated_at (auto-update timestamp)';
  RAISE NOTICE '    • create_document_version (auto-create version history on replace)';
  RAISE NOTICE '  - Helper function: get_engagement_documents';
  RAISE NOTICE '  - Features: Version control, eSign status tracking, document tagging';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_105_ppm_ai_rag.sql';
END $$;
