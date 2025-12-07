-- Migration: 20251207_004_agency_integration.sql
-- Description: Integration with Procure, Finance PPM, T&E, and Gearroom
-- Date: 2025-12-07

-- =============================================================================
-- 1. INTEGRATE WITH PROCURE (Rate Cards & Project Quotes)
-- =============================================================================

-- Add procure_quote_id to campaigns if procure schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'procure') THEN
    -- Link campaigns to Procure quotes
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'agency' 
      AND table_name = 'campaigns' 
      AND column_name = 'procure_quote_id'
    ) THEN
      ALTER TABLE agency.campaigns 
        ADD COLUMN procure_quote_id uuid;
      
      -- Add FK constraint if procure.project_quotes exists
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'procure' 
        AND table_name = 'project_quotes'
      ) THEN
        ALTER TABLE agency.campaigns 
          ADD CONSTRAINT fk_campaigns_procure_quote 
          FOREIGN KEY (procure_quote_id) 
          REFERENCES procure.project_quotes(id);
      END IF;
      
      CREATE INDEX IF NOT EXISTS idx_campaigns_procure_quote 
        ON agency.campaigns(procure_quote_id);
      
      RAISE NOTICE 'Procure integration: procure_quote_id added to campaigns';
    END IF;
  ELSE
    RAISE NOTICE 'Procure schema not found - skipping integration';
  END IF;
END $$;

-- =============================================================================
-- 2. INTEGRATE WITH FINANCE PPM (Project Financials)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'finance_ppm') THEN
    -- Link Finance PPM projects to Agency campaigns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'finance_ppm' 
      AND table_name = 'projects' 
      AND column_name = 'agency_campaign_id'
    ) THEN
      ALTER TABLE finance_ppm.projects 
        ADD COLUMN agency_campaign_id uuid 
        REFERENCES agency.campaigns(id);
      
      CREATE INDEX IF NOT EXISTS idx_ppm_projects_campaign 
        ON finance_ppm.projects(agency_campaign_id);
      
      RAISE NOTICE 'Finance PPM integration: agency_campaign_id added to finance_ppm.projects';
    END IF;
  ELSE
    RAISE NOTICE 'Finance PPM schema not found - skipping integration';
  END IF;
END $$;

-- =============================================================================
-- 3. INTEGRATE WITH T&E (Travel & Expense)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'te' 
    AND table_name = 'expense_lines'
  ) THEN
    -- Link expense lines to campaigns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'te' 
      AND table_name = 'expense_lines' 
      AND column_name = 'agency_campaign_id'
    ) THEN
      ALTER TABLE te.expense_lines 
        ADD COLUMN agency_campaign_id uuid 
        REFERENCES agency.campaigns(id);
      
      CREATE INDEX IF NOT EXISTS idx_expense_lines_campaign 
        ON te.expense_lines(agency_campaign_id);
      
      RAISE NOTICE 'T&E integration: agency_campaign_id added to te.expense_lines';
    END IF;
  ELSE
    RAISE NOTICE 'T&E expense_lines table not found - skipping integration';
  END IF;
END $$;

-- =============================================================================
-- 4. INTEGRATE WITH GEARROOM (Equipment Checkouts)
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'gear' 
    AND table_name = 'checkouts'
  ) THEN
    -- Link checkouts to campaigns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'gear' 
      AND table_name = 'checkouts' 
      AND column_name = 'agency_campaign_id'
    ) THEN
      ALTER TABLE gear.checkouts 
        ADD COLUMN agency_campaign_id uuid 
        REFERENCES agency.campaigns(id);
      
      CREATE INDEX IF NOT EXISTS idx_checkouts_campaign 
        ON gear.checkouts(agency_campaign_id);
      
      RAISE NOTICE 'Gearroom integration: agency_campaign_id added to gear.checkouts';
    END IF;
  ELSE
    RAISE NOTICE 'Gearroom checkouts table not found - skipping integration';
  END IF;
END $$;

-- =============================================================================
-- 5. CREATE INTEGRATION FUNCTIONS
-- =============================================================================

-- Function: Get campaign expenses from T&E
CREATE OR REPLACE FUNCTION agency.get_campaign_expenses(p_campaign_id uuid)
RETURNS TABLE (
  total_expenses numeric,
  expense_count bigint,
  categories jsonb
) AS $$
BEGIN
  -- Check if te.expense_lines exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'te' 
    AND table_name = 'expense_lines'
  ) THEN
    RETURN QUERY
    SELECT 
      COALESCE(SUM(el.amount), 0)::numeric AS total_expenses,
      COUNT(*)::bigint AS expense_count,
      jsonb_object_agg(
        COALESCE(el.category, 'uncategorized'), 
        SUM(el.amount)
      ) AS categories
    FROM te.expense_lines el
    WHERE el.agency_campaign_id = p_campaign_id;
  ELSE
    -- Return empty result if T&E not available
    RETURN QUERY
    SELECT 0::numeric, 0::bigint, '{}'::jsonb;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION agency.get_campaign_expenses IS 'Aggregate campaign expenses from T&E system';

-- Function: Get campaign equipment checkouts
CREATE OR REPLACE FUNCTION agency.get_campaign_equipment(p_campaign_id uuid)
RETURNS TABLE (
  item_id uuid,
  item_name text,
  category text,
  checkout_date date,
  return_date date
) AS $$
BEGIN
  -- Check if gear.checkouts exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'gear' 
    AND table_name = 'checkouts'
  ) THEN
    RETURN QUERY
    SELECT 
      co.item_id,
      i.item_name::text,
      i.category::text,
      co.checkout_date::date,
      co.return_date::date
    FROM gear.checkouts co
    JOIN gear.items i ON i.id = co.item_id
    WHERE co.agency_campaign_id = p_campaign_id
    ORDER BY co.checkout_date DESC;
  ELSE
    -- Return empty result if Gearroom not available
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION agency.get_campaign_equipment IS 'Get equipment checked out for a campaign';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Agency Integration Migration Complete';
  RAISE NOTICE 'Integration columns added (where applicable):';
  RAISE NOTICE '  - campaigns.procure_quote_id → Procure';
  RAISE NOTICE '  - finance_ppm.projects.agency_campaign_id → Finance PPM';
  RAISE NOTICE '  - te.expense_lines.agency_campaign_id → T&E';
  RAISE NOTICE '  - gear.checkouts.agency_campaign_id → Gearroom';
  RAISE NOTICE 'Integration functions created: 2';
END $$;
