-- =====================================================================
-- Finance PPM: Analytics Views
-- Migration: 20251207_106_ppm_analytics_views.sql
-- Description: Create 9 analytics views for PPM dashboards and reports
-- Dependencies: All previous PPM migrations
-- =====================================================================

-- Create analytics schema if not exists
CREATE SCHEMA IF NOT EXISTS analytics;

COMMENT ON SCHEMA analytics IS 'Analytics views for dashboards and reporting across all apps';

-- =====================================================================
-- View 1: analytics.v_ppm_firm_overview
-- Purpose: Firm-wide PPM metrics for Partner/Finance Director dashboard
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_ppm_firm_overview AS
SELECT 
  e.tenant_id,
  
  -- Engagement metrics
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') AS active_engagements,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') AS active_projects,
  
  -- WIP
  COALESCE(SUM(w.total_wip), 0) AS total_wip,
  COALESCE(SUM(w.total_wip) FILTER (WHERE w.ready_to_invoice = true), 0) AS wip_ready_to_invoice,
  COALESCE(SUM(w.total_wip) FILTER (WHERE w.age_bucket = '90+'), 0) AS wip_aging_90plus,
  
  -- AR
  COALESCE(SUM(i.balance), 0) AS ar_outstanding,
  COALESCE(SUM(i.balance) FILTER (WHERE i.due_date >= CURRENT_DATE), 0) AS ar_current,
  COALESCE(SUM(i.balance) FILTER (WHERE i.due_date < CURRENT_DATE), 0) AS ar_overdue,
  COALESCE(SUM(i.balance) FILTER (WHERE i.due_date < CURRENT_DATE - INTERVAL '60 days'), 0) AS ar_60plus,
  
  -- Financials (last 30 days)
  COALESCE(SUM(pf.revenue) FILTER (WHERE pf.period_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '30 days')), 0) AS revenue_last_30d,
  COALESCE(SUM(pf.actual_cost) FILTER (WHERE pf.period_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '30 days')), 0) AS cost_last_30d,
  
  -- Utilization (this month)
  COALESCE((
    SELECT AVG(CASE WHEN total_capacity > 0 THEN (total_hours / total_capacity) * 100 ELSE 0 END)
    FROM (
      SELECT 
        ts.employee_id,
        SUM(ts.hours) AS total_hours,
        160.0 AS total_capacity  -- Monthly capacity assumption
      FROM finance_ppm.timesheet_entries ts
      WHERE ts.entry_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND ts.entry_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        AND ts.tenant_id = e.tenant_id
        AND ts.status = 'approved'
      GROUP BY ts.employee_id
    ) emp_util
  ), 0) AS avg_utilization_this_month
  
FROM finance_ppm.engagements e
LEFT JOIN finance_ppm.projects p ON e.id = p.engagement_id
LEFT JOIN finance_ppm.wip_entries w ON p.id = w.project_id AND w.calculation_date = CURRENT_DATE
LEFT JOIN finance_ppm.invoices i ON p.id = i.project_id AND i.status IN ('sent','partial','overdue')
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id

GROUP BY e.tenant_id;

COMMENT ON VIEW analytics.v_ppm_firm_overview IS 'Firm-wide PPM metrics for dashboard (Partner/Finance Director)';

-- =====================================================================
-- View 2: analytics.v_engagement_profitability
-- Purpose: Profitability analysis per engagement
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_engagement_profitability AS
SELECT 
  e.id AS engagement_id,
  e.tenant_id,
  e.engagement_name,
  e.client_name,
  e.engagement_type,
  e.status,
  e.owner_id,
  
  -- Financial summary
  e.contract_value,
  COALESCE(SUM(pf.budget_amount), 0) AS total_budget,
  COALESCE(SUM(pf.actual_cost), 0) AS total_cost,
  COALESCE(SUM(pf.revenue), 0) AS total_revenue,
  COALESCE(SUM(pf.revenue) - SUM(pf.actual_cost), 0) AS margin_amount,
  CASE 
    WHEN SUM(pf.revenue) > 0 THEN ((SUM(pf.revenue) - SUM(pf.actual_cost)) / SUM(pf.revenue)) * 100
    ELSE 0
  END AS margin_pct,
  
  -- WIP
  COALESCE(SUM(w.total_wip), 0) AS wip_amount,
  
  -- Invoicing
  COUNT(DISTINCT i.id) AS invoice_count,
  COALESCE(SUM(i.total_amount), 0) AS invoiced_amount,
  COALESCE(SUM(i.paid_amount), 0) AS paid_amount,
  COALESCE(SUM(i.balance), 0) AS ar_balance,
  
  -- Variance
  COALESCE(SUM(pf.budget_amount) - SUM(pf.actual_cost), 0) AS budget_variance,
  CASE 
    WHEN SUM(pf.budget_amount) > 0 THEN ((SUM(pf.budget_amount) - SUM(pf.actual_cost)) / SUM(pf.budget_amount)) * 100
    ELSE 0
  END AS budget_variance_pct

FROM finance_ppm.engagements e
LEFT JOIN finance_ppm.projects p ON e.id = p.engagement_id
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id
LEFT JOIN finance_ppm.wip_entries w ON p.id = w.project_id AND w.calculation_date = CURRENT_DATE
LEFT JOIN finance_ppm.invoices i ON p.id = i.project_id

GROUP BY e.id;

COMMENT ON VIEW analytics.v_engagement_profitability IS 'Profitability analysis per engagement (margin, variance, WIP, AR)';

-- =====================================================================
-- View 3: analytics.v_wip_summary
-- Purpose: WIP summary for billing dashboard
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_wip_summary AS
SELECT 
  w.tenant_id,
  p.id AS project_id,
  p.project_code,
  p.project_name,
  e.engagement_name,
  e.client_name,
  
  -- WIP details
  w.calculation_date,
  w.time_wip,
  w.expense_wip,
  w.fee_wip,
  w.total_wip,
  
  -- Aging
  w.oldest_entry_date,
  w.age_days,
  w.age_bucket,
  
  -- Status
  w.ready_to_invoice,
  p.status AS project_status,
  
  -- Last invoice
  MAX(i.invoice_date) AS last_invoice_date,
  CASE 
    WHEN MAX(i.invoice_date) IS NOT NULL THEN CURRENT_DATE - MAX(i.invoice_date)
    ELSE NULL
  END AS days_since_last_invoice

FROM finance_ppm.wip_entries w
JOIN finance_ppm.projects p ON w.project_id = p.id
JOIN finance_ppm.engagements e ON p.engagement_id = e.id
LEFT JOIN finance_ppm.invoices i ON p.id = i.project_id AND i.status != 'cancelled'

WHERE w.calculation_date = CURRENT_DATE
  AND w.total_wip > 0

GROUP BY w.id, p.id, p.project_code, p.project_name, e.engagement_name, e.client_name, w.tenant_id, 
         w.calculation_date, w.time_wip, w.expense_wip, w.fee_wip, w.total_wip,
         w.oldest_entry_date, w.age_days, w.age_bucket, w.ready_to_invoice, p.status;

COMMENT ON VIEW analytics.v_wip_summary IS 'WIP summary for billing dashboard (unbilled work by project)';

-- =====================================================================
-- View 4: analytics.v_ar_aging
-- Purpose: AR aging for accounting dashboard
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_ar_aging AS
SELECT 
  i.tenant_id,
  i.id AS invoice_id,
  i.invoice_number,
  i.invoice_date,
  i.due_date,
  e.client_name,
  p.project_name,
  
  -- Amounts
  i.total_amount,
  i.paid_amount,
  i.balance,
  
  -- Aging
  CURRENT_DATE - i.due_date AS days_overdue,
  CASE 
    WHEN CURRENT_DATE <= i.due_date THEN 'current'
    WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN '1-30'
    WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN '31-60'
    WHEN CURRENT_DATE - i.due_date BETWEEN 61 AND 90 THEN '61-90'
    ELSE '90+'
  END AS age_bucket,
  
  -- Status
  i.status,
  
  -- Collection tracking
  (
    SELECT ca.activity_date
    FROM finance_ppm.collection_activities ca
    WHERE ca.invoice_id = i.id
    ORDER BY ca.activity_date DESC
    LIMIT 1
  ) AS last_contact_date,
  (
    SELECT ca.next_action
    FROM finance_ppm.collection_activities ca
    WHERE ca.invoice_id = i.id
    ORDER BY ca.activity_date DESC
    LIMIT 1
  ) AS next_action,
  (
    SELECT ca.assigned_to
    FROM finance_ppm.collection_activities ca
    WHERE ca.invoice_id = i.id
    ORDER BY ca.activity_date DESC
    LIMIT 1
  ) AS assigned_to

FROM finance_ppm.invoices i
JOIN finance_ppm.projects p ON i.project_id = p.id
JOIN finance_ppm.engagements e ON p.engagement_id = e.id

WHERE i.status IN ('sent','partial','overdue')
  AND i.balance > 0;

COMMENT ON VIEW analytics.v_ar_aging IS 'AR aging analysis for accounting dashboard (overdue invoices, collection tracking)';

-- =====================================================================
-- View 5: analytics.v_utilization_by_role
-- Purpose: Team utilization metrics for capacity planning
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_utilization_by_role AS
SELECT 
  ts.tenant_id,
  ts.employee_id,
  DATE_TRUNC('month', ts.entry_date) AS period_month,
  
  -- Hours
  SUM(ts.hours) AS total_hours,
  SUM(ts.hours) FILTER (WHERE ts.billable = true) AS billable_hours,
  SUM(ts.hours) FILTER (WHERE ts.billable = false) AS non_billable_hours,
  
  -- Capacity & utilization (assume 160 hrs/month)
  160.0 AS monthly_capacity,
  (SUM(ts.hours) / 160.0) * 100 AS utilization_pct,
  (SUM(ts.hours) FILTER (WHERE ts.billable = true) / 160.0) * 100 AS billable_utilization_pct,
  
  -- Projects
  COUNT(DISTINCT ts.project_id) AS project_count,
  
  -- Revenue (for finance roles only - masked via RLS)
  SUM(ts.bill_amount) AS billed_value,
  SUM(ts.cost_amount) AS cost_value

FROM finance_ppm.timesheet_entries ts

WHERE ts.status = 'approved'

GROUP BY ts.tenant_id, ts.employee_id, DATE_TRUNC('month', ts.entry_date);

COMMENT ON VIEW analytics.v_utilization_by_role IS 'Team utilization metrics by employee and month (capacity planning)';

-- =====================================================================
-- View 6: analytics.v_pipeline_summary
-- Purpose: CRM pipeline metrics for sales dashboard
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_pipeline_summary AS
SELECT 
  o.tenant_id,
  o.stage,
  
  -- Counts
  COUNT(*) AS opportunity_count,
  
  -- Values
  SUM(o.expected_value) AS total_value,
  SUM(o.weighted_value) AS weighted_value,
  AVG(o.probability) AS avg_probability,
  
  -- Win rate (for won/lost only)
  COUNT(*) FILTER (WHERE o.status = 'won') AS won_count,
  COUNT(*) FILTER (WHERE o.status = 'lost') AS lost_count,
  CASE 
    WHEN COUNT(*) FILTER (WHERE o.status IN ('won','lost')) > 0 
    THEN (COUNT(*) FILTER (WHERE o.status = 'won')::numeric / COUNT(*) FILTER (WHERE o.status IN ('won','lost'))) * 100
    ELSE 0
  END AS win_rate_pct

FROM crm.opportunities o

WHERE o.created_at >= CURRENT_DATE - INTERVAL '6 months'

GROUP BY o.tenant_id, o.stage;

COMMENT ON VIEW analytics.v_pipeline_summary IS 'CRM pipeline metrics for sales dashboard (by stage, last 6 months)';

-- =====================================================================
-- View 7: analytics.v_project_profitability
-- Purpose: Project-level profitability (drill-down from engagement)
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_project_profitability AS
SELECT 
  p.id AS project_id,
  p.tenant_id,
  p.project_code,
  p.project_name,
  p.status,
  e.engagement_name,
  e.client_name,
  
  -- Financial summary
  COALESCE(SUM(pf.budget_amount), 0) AS total_budget,
  COALESCE(SUM(pf.actual_cost), 0) AS total_cost,
  COALESCE(SUM(pf.revenue), 0) AS total_revenue,
  COALESCE(SUM(pf.revenue) - SUM(pf.actual_cost), 0) AS margin_amount,
  CASE 
    WHEN SUM(pf.revenue) > 0 THEN ((SUM(pf.revenue) - SUM(pf.actual_cost)) / SUM(pf.revenue)) * 100
    ELSE 0
  END AS margin_pct,
  
  -- Variance
  COALESCE(SUM(pf.variance_amount), 0) AS budget_variance,
  COALESCE(AVG(pf.variance_pct), 0) AS budget_variance_pct,
  
  -- Time tracking
  COALESCE(SUM(ts.hours), 0) AS total_hours,
  COALESCE(SUM(ts.hours) FILTER (WHERE ts.billable = true), 0) AS billable_hours,
  
  -- WIP
  COALESCE(w.total_wip, 0) AS wip_amount,
  
  -- Tasks
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') AS completed_tasks,
  CASE 
    WHEN COUNT(DISTINCT t.id) > 0 THEN (COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done')::numeric / COUNT(DISTINCT t.id)) * 100
    ELSE 0
  END AS completion_pct

FROM finance_ppm.projects p
JOIN finance_ppm.engagements e ON p.engagement_id = e.id
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id
LEFT JOIN finance_ppm.timesheet_entries ts ON p.id = ts.project_id AND ts.status = 'approved'
LEFT JOIN finance_ppm.tasks t ON p.id = t.project_id
LEFT JOIN finance_ppm.wip_entries w ON p.id = w.project_id AND w.calculation_date = CURRENT_DATE

GROUP BY p.id, e.id, e.engagement_name, e.client_name, w.total_wip;

COMMENT ON VIEW analytics.v_project_profitability IS 'Project-level profitability analysis (margin, variance, completion)';

-- =====================================================================
-- View 8: analytics.v_revenue_by_client
-- Purpose: Revenue ranking by client
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_revenue_by_client AS
SELECT 
  e.tenant_id,
  e.client_name,
  
  -- Engagement counts
  COUNT(DISTINCT e.id) AS engagement_count,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') AS active_engagement_count,
  
  -- Revenue
  COALESCE(SUM(pf.revenue), 0) AS total_revenue,
  COALESCE(SUM(pf.revenue) FILTER (WHERE pf.period_month >= DATE_TRUNC('year', CURRENT_DATE)), 0) AS revenue_ytd,
  COALESCE(SUM(pf.revenue) FILTER (WHERE pf.period_month >= DATE_TRUNC('month', CURRENT_DATE)), 0) AS revenue_this_month,
  
  -- Profitability
  COALESCE(SUM(pf.revenue) - SUM(pf.actual_cost), 0) AS margin_amount,
  CASE 
    WHEN SUM(pf.revenue) > 0 THEN ((SUM(pf.revenue) - SUM(pf.actual_cost)) / SUM(pf.revenue)) * 100
    ELSE 0
  END AS margin_pct,
  
  -- AR
  COALESCE(SUM(i.balance), 0) AS ar_balance,
  
  -- WIP
  COALESCE(SUM(w.total_wip), 0) AS wip_amount

FROM finance_ppm.engagements e
LEFT JOIN finance_ppm.projects p ON e.id = p.engagement_id
LEFT JOIN finance_ppm.project_financials pf ON p.id = pf.project_id
LEFT JOIN finance_ppm.invoices i ON p.id = i.project_id AND i.status IN ('sent','partial','overdue')
LEFT JOIN finance_ppm.wip_entries w ON p.id = w.project_id AND w.calculation_date = CURRENT_DATE

GROUP BY e.tenant_id, e.client_name

ORDER BY total_revenue DESC;

COMMENT ON VIEW analytics.v_revenue_by_client IS 'Revenue ranking by client (YTD, margin, AR, WIP)';

-- =====================================================================
-- View 9: analytics.v_month_end_checklist
-- Purpose: Month-end close status tracking
-- =====================================================================

CREATE OR REPLACE VIEW analytics.v_month_end_checklist AS
SELECT 
  tenant_id,
  DATE_TRUNC('month', CURRENT_DATE) AS close_month,
  
  -- WIP status
  (SELECT COUNT(*) FROM finance_ppm.wip_entries 
   WHERE calculation_date = (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date
   AND tenant_id = e.tenant_id) AS wip_calculated,
  
  -- Timesheet approval
  (SELECT COUNT(*) FROM finance_ppm.timesheet_entries 
   WHERE status = 'submitted' 
   AND entry_date < DATE_TRUNC('month', CURRENT_DATE)
   AND tenant_id = e.tenant_id) AS timesheets_pending_approval,
  
  -- Invoicing
  (SELECT COUNT(*) FROM finance_ppm.wip_entries 
   WHERE ready_to_invoice = true 
   AND calculation_date = CURRENT_DATE
   AND tenant_id = e.tenant_id) AS wip_ready_to_invoice,
  
  -- AR reconciliation
  (SELECT COUNT(*) FROM finance_ppm.invoices 
   WHERE status IN ('sent','partial','overdue')
   AND balance > 0
   AND tenant_id = e.tenant_id) AS invoices_unpaid,
  
  -- Revenue recognition
  (SELECT COALESCE(SUM(revenue), 0) FROM finance_ppm.project_financials 
   WHERE period_month = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
   AND tenant_id = e.tenant_id) AS revenue_last_month,
  
  -- Status flags
  CASE 
    WHEN (SELECT COUNT(*) FROM finance_ppm.timesheet_entries WHERE status = 'submitted' AND tenant_id = e.tenant_id) = 0 
    THEN 'Complete'
    ELSE 'Pending'
  END AS timesheet_status,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM finance_ppm.wip_entries 
          WHERE calculation_date = (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date 
          AND tenant_id = e.tenant_id) > 0 
    THEN 'Complete'
    ELSE 'Pending'
  END AS wip_status

FROM finance_ppm.engagements e

GROUP BY tenant_id;

COMMENT ON VIEW analytics.v_month_end_checklist IS 'Month-end close status tracking (timesheets, WIP, invoicing, AR)';

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Finance PPM Analytics Views migration complete:';
  RAISE NOTICE '  - Schema: analytics (created if not exists)';
  RAISE NOTICE '  - Views created (9 views):';
  RAISE NOTICE '    1. v_ppm_firm_overview - Firm-wide KPIs';
  RAISE NOTICE '    2. v_engagement_profitability - Engagement P&L';
  RAISE NOTICE '    3. v_wip_summary - WIP by project';
  RAISE NOTICE '    4. v_ar_aging - AR aging analysis';
  RAISE NOTICE '    5. v_utilization_by_role - Team utilization';
  RAISE NOTICE '    6. v_pipeline_summary - CRM pipeline metrics';
  RAISE NOTICE '    7. v_project_profitability - Project P&L';
  RAISE NOTICE '    8. v_revenue_by_client - Client revenue ranking';
  RAISE NOTICE '    9. v_month_end_checklist - Close status tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'All views support tenant isolation and role-based access (via RLS on base tables)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next migration: 20251207_107_ppm_rls_policies.sql';
END $$;
