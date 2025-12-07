-- Migration: 20251207_006_agency_views.sql
-- Description: Analytics views and helper functions
-- Date: 2025-12-07

-- =============================================================================
-- 1. VIEW: Dashboard KPIs
-- =============================================================================

CREATE OR REPLACE VIEW agency.v_dashboard_kpis AS
WITH current_month AS (
  SELECT DATE_TRUNC('month', CURRENT_DATE)::date AS month_start
),
timesheet_summary AS (
  SELECT 
    SUM(te.hours) FILTER (WHERE te.billable = true) AS billable_hours,
    SUM(te.hours) AS total_hours
  FROM agency.timesheet_entries te
  WHERE te.week_start_date = DATE_TRUNC('week', CURRENT_DATE)::date
    AND te.status = 'approved'
)
SELECT 
  -- Active Clients
  COUNT(DISTINCT cl.id) FILTER (WHERE cl.status = 'active') AS active_clients,
  
  -- Active Campaigns
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('active', 'planning')) AS active_campaigns,
  
  -- Campaign Revenue YTD (placeholder - will integrate with Finance PPM)
  COALESCE(SUM(c.budget_amount), 0) AS campaign_revenue_ytd,
  
  -- Monthly Margin (placeholder)
  25.0 AS monthly_margin_pct,
  
  -- Team Utilization (Current Week)
  COALESCE(
    (ts.billable_hours / NULLIF(ts.total_hours, 0)) * 100, 
    0
  ) AS team_utilization_pct

FROM agency.clients cl
CROSS JOIN timesheet_summary ts
LEFT JOIN agency.campaigns c ON c.client_id = cl.id
WHERE cl.tenant_id = current_setting('app.current_tenant', true)::uuid;

COMMENT ON VIEW agency.v_dashboard_kpis IS 'Home dashboard KPI tiles';

-- =============================================================================
-- 2. VIEW: Campaign Overview
-- =============================================================================

CREATE OR REPLACE VIEW agency.v_campaign_overview AS
SELECT 
  c.id,
  c.campaign_code,
  c.campaign_name,
  c.campaign_type,
  c.status,
  c.start_date,
  c.end_date,
  c.duration_weeks,
  
  -- Client & Brand
  c.client_id,
  cl.client_name,
  cl.client_code,
  c.brand_id,
  b.brand_name,
  
  -- Budget
  c.budget_amount,
  c.budget_currency,
  
  -- Team
  c.account_director_id,
  c.project_manager_id,
  c.creative_director_id,
  
  -- Artifacts
  COUNT(DISTINCT a.id) AS artifact_count,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'approved') AS approved_artifact_count,
  
  -- Timesheets
  COALESCE(SUM(te.hours), 0) AS total_hours_logged,
  COALESCE(SUM(te.hours) FILTER (WHERE te.billable = true), 0) AS billable_hours_logged,
  
  -- Phases
  COUNT(DISTINCT cp.id) AS phase_count,
  AVG(cp.completion_pct) AS avg_phase_completion,
  
  -- Health (placeholder - will integrate with Finance PPM for actual margin)
  CASE 
    WHEN c.status = 'completed' THEN 'completed'
    WHEN c.status = 'cancelled' THEN 'cancelled'
    WHEN c.end_date < CURRENT_DATE THEN 'overdue'
    ELSE 'on_track'
  END AS health_status,
  
  -- Audit
  c.created_at,
  c.updated_at

FROM agency.campaigns c
LEFT JOIN agency.clients cl ON cl.id = c.client_id
LEFT JOIN agency.brands b ON b.id = c.brand_id
LEFT JOIN agency.artifacts a ON a.campaign_id = c.id
LEFT JOIN agency.timesheet_entries te ON te.campaign_id = c.id AND te.status = 'approved'
LEFT JOIN agency.campaign_phases cp ON cp.campaign_id = c.id

GROUP BY 
  c.id, c.campaign_code, c.campaign_name, c.campaign_type, c.status,
  c.start_date, c.end_date, c.duration_weeks, c.budget_amount, c.budget_currency,
  c.client_id, cl.client_name, cl.client_code,
  c.brand_id, b.brand_name,
  c.account_director_id, c.project_manager_id, c.creative_director_id,
  c.created_at, c.updated_at;

COMMENT ON VIEW agency.v_campaign_overview IS 'Campaign list with key metrics';

-- =============================================================================
-- 3. VIEW: Client 360
-- =============================================================================

CREATE OR REPLACE VIEW agency.v_client_360 AS
SELECT 
  cl.id,
  cl.client_code,
  cl.client_name,
  cl.client_name_short,
  cl.sector,
  cl.industry,
  cl.region,
  cl.retention_type,
  cl.status,
  cl.contract_start_date,
  cl.contract_end_date,
  cl.contract_value,
  
  -- Brands
  COUNT(DISTINCT b.id) AS brand_count,
  
  -- Campaigns
  COUNT(DISTINCT c.id) AS total_campaigns,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') AS active_campaigns,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'completed') AS completed_campaigns,
  
  -- Budget (sum of campaign budgets)
  COALESCE(SUM(c.budget_amount), 0) AS total_budget,
  
  -- Artifacts
  COUNT(DISTINCT a.id) AS artifact_count,
  
  -- Last Activity
  MAX(c.updated_at) AS last_campaign_update,
  
  -- Audit
  cl.created_at,
  cl.updated_at

FROM agency.clients cl
LEFT JOIN agency.brands b ON b.client_id = cl.id
LEFT JOIN agency.campaigns c ON c.client_id = cl.id
LEFT JOIN agency.artifacts a ON a.client_id = cl.id

GROUP BY 
  cl.id, cl.client_code, cl.client_name, cl.client_name_short,
  cl.sector, cl.industry, cl.region, cl.retention_type, cl.status,
  cl.contract_start_date, cl.contract_end_date, cl.contract_value,
  cl.created_at, cl.updated_at;

COMMENT ON VIEW agency.v_client_360 IS 'Client 360-degree view with aggregated metrics';

-- =============================================================================
-- 4. VIEW: Employee Utilization
-- =============================================================================

CREATE OR REPLACE VIEW agency.v_employee_utilization AS
WITH weekly_capacity AS (
  SELECT 40 AS standard_hours_per_week
)
SELECT 
  te.employee_id,
  te.week_start_date,
  
  -- Hours
  SUM(te.hours) AS total_hours,
  SUM(te.hours) FILTER (WHERE te.billable = true) AS billable_hours,
  SUM(te.hours) FILTER (WHERE te.billable = false) AS non_billable_hours,
  
  -- Utilization
  ROUND(
    (SUM(te.hours) / (SELECT standard_hours_per_week FROM weekly_capacity)) * 100, 
    1
  ) AS capacity_pct,
  ROUND(
    (SUM(te.hours) FILTER (WHERE te.billable = true) / NULLIF(SUM(te.hours), 0)) * 100,
    1
  ) AS billable_pct,
  
  -- Campaigns worked on
  COUNT(DISTINCT te.campaign_id) AS campaign_count,
  
  -- Status
  CASE 
    WHEN SUM(te.hours) > (SELECT standard_hours_per_week FROM weekly_capacity) * 1.2 THEN 'overallocated'
    WHEN SUM(te.hours) < (SELECT standard_hours_per_week FROM weekly_capacity) * 0.2 THEN 'underutilized'
    ELSE 'normal'
  END AS utilization_status

FROM agency.timesheet_entries te
WHERE te.status = 'approved'

GROUP BY te.employee_id, te.week_start_date;

COMMENT ON VIEW agency.v_employee_utilization IS 'Employee utilization by week';

-- =============================================================================
-- 5. VIEW: Artifact Library
-- =============================================================================

CREATE OR REPLACE VIEW agency.v_artifact_library AS
SELECT 
  a.id,
  a.artifact_code,
  a.title,
  a.artifact_type,
  a.sub_type,
  a.status,
  a.version,
  
  -- Campaign
  a.campaign_id,
  c.campaign_code,
  c.campaign_name,
  
  -- Client
  a.client_id,
  cl.client_name,
  
  -- Brand
  a.brand_id,
  b.brand_name,
  
  -- Content
  a.content_preview,
  a.content_url,
  a.file_size_bytes,
  a.mime_type,
  
  -- Metadata
  a.tags,
  a.icon,
  a.description,
  
  -- Ownership
  a.owner_id,
  a.approver_id,
  a.approved_at,
  
  -- Analytics
  a.view_count,
  a.download_count,
  a.last_viewed_at,
  
  -- Comments
  (
    SELECT COUNT(*) 
    FROM agency.artifact_comments ac 
    WHERE ac.artifact_id = a.id
  ) AS comment_count,
  
  (
    SELECT COUNT(*) 
    FROM agency.artifact_comments ac 
    WHERE ac.artifact_id = a.id AND ac.is_resolved = false
  ) AS unresolved_comment_count,
  
  -- Audit
  a.created_at,
  a.updated_at

FROM agency.artifacts a
LEFT JOIN agency.campaigns c ON c.id = a.campaign_id
LEFT JOIN agency.clients cl ON cl.id = a.client_id
LEFT JOIN agency.brands b ON b.id = a.brand_id;

COMMENT ON VIEW agency.v_artifact_library IS 'Artifact library with aggregated metadata';

-- =============================================================================
-- 6. VIEW: Timesheet Summary by Campaign
-- =============================================================================

CREATE OR REPLACE VIEW agency.v_timesheet_summary_by_campaign AS
SELECT 
  c.id AS campaign_id,
  c.campaign_code,
  c.campaign_name,
  c.client_id,
  cl.client_name,
  
  -- Hours
  COALESCE(SUM(te.hours), 0) AS total_hours,
  COALESCE(SUM(te.hours) FILTER (WHERE te.billable = true), 0) AS billable_hours,
  COALESCE(SUM(te.hours) FILTER (WHERE te.billable = false), 0) AS non_billable_hours,
  
  -- Team
  COUNT(DISTINCT te.employee_id) AS team_member_count,
  
  -- Value (if rates available)
  COALESCE(SUM(te.hours * te.internal_cost_rate), 0) AS total_internal_cost,
  COALESCE(SUM(te.hours * te.client_billing_rate), 0) AS total_client_value,
  
  -- Date Range
  MIN(te.entry_date) AS first_timesheet_date,
  MAX(te.entry_date) AS last_timesheet_date

FROM agency.campaigns c
LEFT JOIN agency.clients cl ON cl.id = c.client_id
LEFT JOIN agency.timesheet_entries te ON te.campaign_id = c.id AND te.status = 'approved'

GROUP BY c.id, c.campaign_code, c.campaign_name, c.client_id, cl.client_name;

COMMENT ON VIEW agency.v_timesheet_summary_by_campaign IS 'Timesheet summary aggregated by campaign';

-- =============================================================================
-- 7. HELPER FUNCTION: Get Recent Activity
-- =============================================================================

CREATE OR REPLACE FUNCTION agency.get_recent_activity(
  p_limit integer DEFAULT 20,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  activity_type varchar,
  entity_type varchar,
  entity_id uuid,
  entity_name text,
  action varchar,
  user_id uuid,
  timestamp timestamptz
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  
  -- Campaign activities
  SELECT 
    'campaign'::varchar AS activity_type,
    'campaign'::varchar AS entity_type,
    c.id AS entity_id,
    c.campaign_name::text AS entity_name,
    CASE 
      WHEN c.created_at = c.updated_at THEN 'created'
      ELSE 'updated'
    END AS action,
    c.updated_by AS user_id,
    c.updated_at AS timestamp
  FROM agency.campaigns c
  WHERE c.tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (p_user_id IS NULL OR c.updated_by = p_user_id)
  
  UNION ALL
  
  -- Artifact activities
  SELECT 
    'artifact'::varchar,
    'artifact'::varchar,
    a.id,
    a.title::text,
    CASE 
      WHEN a.created_at = a.updated_at THEN 'created'
      WHEN a.status = 'approved' AND a.approved_at IS NOT NULL THEN 'approved'
      ELSE 'updated'
    END,
    a.updated_by,
    a.updated_at
  FROM agency.artifacts a
  WHERE a.tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (p_user_id IS NULL OR a.updated_by = p_user_id)
  
  UNION ALL
  
  -- Comment activities
  SELECT 
    'comment'::varchar,
    'artifact'::varchar,
    ac.artifact_id,
    a.title::text,
    'commented',
    ac.commenter_id,
    ac.created_at
  FROM agency.artifact_comments ac
  JOIN agency.artifacts a ON a.id = ac.artifact_id
  WHERE ac.tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (p_user_id IS NULL OR ac.commenter_id = p_user_id)
  
  ORDER BY timestamp DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION agency.get_recent_activity IS 'Get recent activity feed for dashboard';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Agency Views Migration Complete';
  RAISE NOTICE 'Views created: 6';
  RAISE NOTICE '  - v_dashboard_kpis';
  RAISE NOTICE '  - v_campaign_overview';
  RAISE NOTICE '  - v_client_360';
  RAISE NOTICE '  - v_employee_utilization';
  RAISE NOTICE '  - v_artifact_library';
  RAISE NOTICE '  - v_timesheet_summary_by_campaign';
  RAISE NOTICE 'Functions created: 1 (get_recent_activity)';
END $$;
