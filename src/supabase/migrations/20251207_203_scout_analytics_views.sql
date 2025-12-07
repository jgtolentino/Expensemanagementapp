-- =====================================================================
-- Scout Dashboard - Migration 4: Analytics Views
-- =====================================================================
-- Purpose: Create 7 analytics views for dashboard pages
-- Dependencies: 20251207_202_scout_fact_tables.sql
-- Author: TBWA Agency Databank
-- Date: 2025-12-07
-- =====================================================================

-- =====================================================================
-- VIEW 1: scout.v_transaction_trends
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_transaction_trends AS
SELECT
  t.tenant_id,
  DATE(t.timestamp) as transaction_date,
  t.region,
  t.product_category,
  
  -- Volume
  COUNT(DISTINCT t.basket_id) as basket_count,
  COUNT(*) as item_count,
  COUNT(DISTINCT t.customer_id) as unique_customers,
  
  -- Revenue
  SUM(t.line_amount) as total_revenue,
  AVG(t.line_amount) as avg_item_revenue,
  
  -- Basket Metrics
  AVG(b.item_count) as avg_items_per_basket,
  AVG(b.total_units) as avg_units_per_basket,
  AVG(b.total_amount) as avg_basket_value,
  
  -- Duration
  AVG(b.duration_seconds) as avg_duration_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY b.duration_seconds) as median_duration_seconds,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END) as impulse_basket_count,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(DISTINCT b.id), 0) as impulse_rate,
  
  -- Time Patterns
  SUM(CASE WHEN t.time_of_day = 'morning' THEN 1 ELSE 0 END) as morning_count,
  SUM(CASE WHEN t.time_of_day = 'afternoon' THEN 1 ELSE 0 END) as afternoon_count,
  SUM(CASE WHEN t.time_of_day = 'evening' THEN 1 ELSE 0 END) as evening_count,
  SUM(CASE WHEN t.time_of_day = 'night' THEN 1 ELSE 0 END) as night_count,
  
  SUM(CASE WHEN t.is_weekend THEN 1 ELSE 0 END) as weekend_count,
  SUM(CASE WHEN NOT t.is_weekend THEN 1 ELSE 0 END) as weekday_count,
  
  -- Request Behavior
  SUM(CASE WHEN t.request_type = 'branded' THEN 1 ELSE 0 END) as branded_request_count,
  SUM(CASE WHEN t.request_type = 'unbranded' THEN 1 ELSE 0 END) as unbranded_request_count,
  SUM(CASE WHEN t.request_type = 'unsure' THEN 1 ELSE 0 END) as unsure_request_count,
  
  SUM(CASE WHEN t.request_mode = 'verbal' THEN 1 ELSE 0 END) as verbal_request_count,
  SUM(CASE WHEN t.request_mode = 'pointing' THEN 1 ELSE 0 END) as pointing_request_count,
  SUM(CASE WHEN t.request_mode = 'indirect' THEN 1 ELSE 0 END) as indirect_request_count,
  
  -- Suggestions
  SUM(CASE WHEN t.store_suggestion_made THEN 1 ELSE 0 END) as suggestion_made_count,
  SUM(CASE WHEN t.store_suggestion_accepted THEN 1 ELSE 0 END) as suggestion_accepted_count,
  SUM(CASE WHEN t.store_suggestion_accepted THEN 1 ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN t.store_suggestion_made THEN 1 ELSE 0 END), 0) as suggestion_acceptance_rate,
  
  -- Substitutions
  SUM(CASE WHEN t.is_substituted THEN 1 ELSE 0 END) as substitution_count,
  SUM(CASE WHEN t.is_substituted THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as substitution_rate

FROM scout.transactions t
LEFT JOIN scout.baskets b ON t.basket_id = b.id
GROUP BY t.tenant_id, transaction_date, t.region, t.product_category;

GRANT SELECT ON scout.v_transaction_trends TO authenticated;

COMMENT ON VIEW scout.v_transaction_trends IS 'Transaction Trends page - all 4 tabs (Volume, Revenue, Basket Size, Duration)';

-- =====================================================================
-- VIEW 2: scout.v_product_mix
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_product_mix AS
SELECT
  t.tenant_id,
  t.product_id,
  t.sku,
  t.product_name,
  t.brand_id,
  (SELECT brand_name FROM scout.brands WHERE id = t.brand_id LIMIT 1) as brand_name,
  t.product_category,
  t.product_subcategory,
  
  -- Revenue
  SUM(t.line_amount) as total_revenue,
  COUNT(*) as transaction_count,
  SUM(t.quantity) as total_units_sold,
  AVG(t.unit_price) as avg_unit_price,
  
  -- Share Metrics
  SUM(t.line_amount) / NULLIF(SUM(SUM(t.line_amount)) OVER (PARTITION BY t.tenant_id, t.product_category), 0) as category_share,
  SUM(t.line_amount) / NULLIF(SUM(SUM(t.line_amount)) OVER (PARTITION BY t.tenant_id), 0) as overall_share,
  
  -- Pareto Ranking
  ROW_NUMBER() OVER (PARTITION BY t.tenant_id ORDER BY SUM(t.line_amount) DESC) as revenue_rank,
  SUM(SUM(t.line_amount)) OVER (PARTITION BY t.tenant_id ORDER BY SUM(t.line_amount) DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) /
    NULLIF(SUM(SUM(t.line_amount)) OVER (PARTITION BY t.tenant_id), 0) as cumulative_revenue_pct,
  
  -- Basket Analysis
  COUNT(DISTINCT t.basket_id) as basket_appearance_count,
  COUNT(DISTINCT t.basket_id)::numeric / NULLIF((SELECT COUNT(DISTINCT basket_id) FROM scout.transactions WHERE tenant_id = t.tenant_id), 0) as basket_penetration,
  
  -- Geography
  COUNT(DISTINCT t.region) as regions_sold_in,
  COUNT(DISTINCT t.store_id) as stores_sold_in,
  
  -- Substitution
  SUM(CASE WHEN t.is_substituted THEN 1 ELSE 0 END) as times_substituted,
  (SELECT COUNT(*) FROM scout.transactions WHERE tenant_id = t.tenant_id AND original_product_id = t.product_id) as times_requested_but_substituted

FROM scout.transactions t
GROUP BY t.tenant_id, t.product_id, t.sku, t.product_name, t.brand_id, t.product_category, t.product_subcategory;

GRANT SELECT ON scout.v_product_mix TO authenticated;

COMMENT ON VIEW scout.v_product_mix IS 'Product Mix page - Category Mix, Pareto, Basket Analysis tabs';

-- =====================================================================
-- VIEW 3: scout.v_substitution_flows
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_substitution_flows AS
SELECT
  t.tenant_id,
  
  -- Original (Requested)
  t.original_product_id,
  op.sku as original_sku,
  op.product_name as original_product_name,
  t.original_brand_id,
  ob.brand_name as original_brand_name,
  
  -- Substitute (Purchased)
  t.product_id as substitute_product_id,
  p.sku as substitute_sku,
  p.product_name as substitute_product_name,
  t.brand_id as substitute_brand_id,
  b.brand_name as substitute_brand_name,
  
  -- Substitution Metrics
  COUNT(*) as substitution_count,
  t.substitution_reason,
  
  -- Revenue Impact
  SUM(t.line_amount) as substitute_revenue,
  AVG(t.unit_price) as avg_substitute_price,
  
  -- Geography
  t.region,
  COUNT(DISTINCT t.store_id) as stores_with_substitution

FROM scout.transactions t
JOIN scout.products p ON t.product_id = p.id
JOIN scout.brands b ON t.brand_id = b.id
LEFT JOIN scout.products op ON t.original_product_id = op.id
LEFT JOIN scout.brands ob ON t.original_brand_id = ob.id
WHERE t.is_substituted = true
GROUP BY 
  t.tenant_id,
  t.original_product_id, op.sku, op.product_name,
  t.original_brand_id, ob.brand_name,
  t.product_id, p.sku, p.product_name,
  t.brand_id, b.brand_name,
  t.substitution_reason,
  t.region;

GRANT SELECT ON scout.v_substitution_flows TO authenticated;

COMMENT ON VIEW scout.v_substitution_flows IS 'Product Mix - Substitutions tab (A→B flows)';

-- =====================================================================
-- VIEW 4: scout.v_consumer_behavior
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_consumer_behavior AS
SELECT
  t.tenant_id,
  DATE(t.timestamp) as behavior_date,
  t.region,
  t.product_category,
  
  -- Request Type Breakdown
  SUM(CASE WHEN t.request_type = 'branded' THEN 1 ELSE 0 END) as branded_request_count,
  SUM(CASE WHEN t.request_type = 'unbranded' THEN 1 ELSE 0 END) as unbranded_request_count,
  SUM(CASE WHEN t.request_type = 'unsure' THEN 1 ELSE 0 END) as unsure_request_count,
  
  SUM(CASE WHEN t.request_type = 'branded' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as branded_request_pct,
  SUM(CASE WHEN t.request_type = 'unbranded' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as unbranded_request_pct,
  SUM(CASE WHEN t.request_type = 'unsure' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as unsure_request_pct,
  
  -- Request Mode Breakdown
  SUM(CASE WHEN t.request_mode = 'verbal' THEN 1 ELSE 0 END) as verbal_request_count,
  SUM(CASE WHEN t.request_mode = 'pointing' THEN 1 ELSE 0 END) as pointing_request_count,
  SUM(CASE WHEN t.request_mode = 'indirect' THEN 1 ELSE 0 END) as indirect_request_count,
  
  SUM(CASE WHEN t.request_mode = 'verbal' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as verbal_request_pct,
  SUM(CASE WHEN t.request_mode = 'pointing' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as pointing_request_pct,
  SUM(CASE WHEN t.request_mode = 'indirect' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) as indirect_request_pct,
  
  -- Store Suggestions
  SUM(CASE WHEN t.store_suggestion_made THEN 1 ELSE 0 END) as suggestion_made_count,
  SUM(CASE WHEN t.store_suggestion_accepted THEN 1 ELSE 0 END) as suggestion_accepted_count,
  SUM(CASE WHEN t.store_suggestion_made AND NOT COALESCE(t.store_suggestion_accepted, false) THEN 1 ELSE 0 END) as suggestion_rejected_count,
  
  SUM(CASE WHEN t.store_suggestion_accepted THEN 1 ELSE 0 END)::numeric / 
    NULLIF(SUM(CASE WHEN t.store_suggestion_made THEN 1 ELSE 0 END), 0) as suggestion_acceptance_rate,
  
  -- Purchase Funnel (simplified)
  COUNT(DISTINCT t.customer_id) as unique_customers,
  COUNT(DISTINCT t.basket_id) as baskets,
  COUNT(*) as items_purchased,
  
  -- Impulse Behavior
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END) as impulse_basket_count,
  SUM(CASE WHEN NOT b.is_impulse THEN 1 ELSE 0 END) as planned_basket_count,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(DISTINCT b.id), 0) as impulse_rate

FROM scout.transactions t
LEFT JOIN scout.baskets b ON t.basket_id = b.id
GROUP BY t.tenant_id, behavior_date, t.region, t.product_category;

GRANT SELECT ON scout.v_consumer_behavior TO authenticated;

COMMENT ON VIEW scout.v_consumer_behavior IS 'Consumer Behavior page - Request Methods, Acceptance Rates, Behavior Traits tabs';

-- =====================================================================
-- VIEW 5: scout.v_consumer_profiling
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_consumer_profiling AS
SELECT
  t.tenant_id,
  DATE(t.timestamp) as profile_date,
  t.region,
  t.product_category,
  
  -- Demographics
  c.gender,
  c.age_bracket,
  c.income_segment,
  c.urban_rural,
  
  -- Metrics
  COUNT(DISTINCT c.id) as unique_customers,
  COUNT(DISTINCT t.basket_id) as basket_count,
  COUNT(*) as item_count,
  SUM(t.line_amount) as total_revenue,
  AVG(b.total_amount) as avg_basket_value,
  AVG(b.item_count) as avg_items_per_basket,
  
  -- Behavioral
  AVG(b.duration_seconds) as avg_duration_seconds,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(DISTINCT b.id), 0) as impulse_rate,
  
  -- Frequency
  AVG(c.total_transactions) as avg_lifetime_transactions,
  AVG(c.lifetime_value) as avg_lifetime_value,
  SUM(CASE WHEN c.is_repeat_customer THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(DISTINCT c.id), 0) as repeat_customer_rate

FROM scout.transactions t
JOIN scout.customers c ON t.customer_id = c.id
LEFT JOIN scout.baskets b ON t.basket_id = b.id
WHERE t.customer_id IS NOT NULL
GROUP BY 
  t.tenant_id, 
  profile_date, 
  t.region, 
  t.product_category,
  c.gender, 
  c.age_bracket, 
  c.income_segment, 
  c.urban_rural;

GRANT SELECT ON scout.v_consumer_profiling TO authenticated;

COMMENT ON VIEW scout.v_consumer_profiling IS 'Consumer Profiling page - Demographics, Age & Gender, Location, Segment Behavior tabs';

-- =====================================================================
-- VIEW 6: scout.v_geo_intelligence
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_geo_intelligence AS
SELECT
  t.tenant_id,
  t.island_group,
  t.region,
  t.province,
  t.city,
  
  -- Revenue & Volume
  SUM(t.line_amount) as total_revenue,
  COUNT(DISTINCT t.basket_id) as basket_count,
  COUNT(*) as item_count,
  COUNT(DISTINCT t.customer_id) as unique_customers,
  
  -- Store Metrics
  COUNT(DISTINCT t.store_id) as active_stores,
  SUM(t.line_amount) / NULLIF(COUNT(DISTINCT t.store_id), 0) as revenue_per_store,
  
  -- Demographics
  COUNT(DISTINCT CASE WHEN s.urban_rural = 'urban' THEN t.store_id END) as urban_stores,
  COUNT(DISTINCT CASE WHEN s.urban_rural = 'rural' THEN t.store_id END) as rural_stores,
  
  SUM(CASE WHEN s.urban_rural = 'urban' THEN t.line_amount ELSE 0 END) as urban_revenue,
  SUM(CASE WHEN s.urban_rural = 'rural' THEN t.line_amount ELSE 0 END) as rural_revenue,
  
  -- Category Mix
  SUM(CASE WHEN t.product_category = 'beverage' THEN t.line_amount ELSE 0 END) as beverage_revenue,
  SUM(CASE WHEN t.product_category = 'snacks' THEN t.line_amount ELSE 0 END) as snacks_revenue,
  SUM(CASE WHEN t.product_category = 'tobacco' THEN t.line_amount ELSE 0 END) as tobacco_revenue,
  SUM(CASE WHEN t.product_category = 'household' THEN t.line_amount ELSE 0 END) as household_revenue,
  SUM(CASE WHEN t.product_category = 'personal_care' THEN t.line_amount ELSE 0 END) as personal_care_revenue,
  SUM(CASE WHEN t.product_category = 'others' THEN t.line_amount ELSE 0 END) as others_revenue

FROM scout.transactions t
JOIN scout.stores s ON t.store_id = s.id
GROUP BY 
  t.tenant_id,
  t.island_group,
  t.region,
  t.province,
  t.city;

GRANT SELECT ON scout.v_geo_intelligence TO authenticated;

COMMENT ON VIEW scout.v_geo_intelligence IS 'Geo Intelligence page - Regional Performance, Store Locations, Demographics, Market Penetration tabs';

-- =====================================================================
-- VIEW 7: scout.v_dashboard_overview
-- =====================================================================

CREATE OR REPLACE VIEW scout.v_dashboard_overview AS
SELECT
  t.tenant_id,
  
  -- Volume
  COUNT(DISTINCT t.basket_id) as total_baskets,
  COUNT(*) as total_items,
  COUNT(DISTINCT t.customer_id) as unique_customers,
  COUNT(DISTINCT t.store_id) as active_stores,
  
  -- Revenue
  SUM(t.line_amount) as total_revenue,
  AVG(b.total_amount) as avg_basket_value,
  
  -- Basket Metrics
  AVG(b.item_count) as avg_items_per_basket,
  AVG(b.total_units) as avg_units_per_basket,
  
  -- Time
  AVG(b.duration_seconds) as avg_duration_seconds

FROM scout.transactions t
LEFT JOIN scout.baskets b ON t.basket_id = b.id
GROUP BY t.tenant_id;

GRANT SELECT ON scout.v_dashboard_overview TO authenticated;

COMMENT ON VIEW scout.v_dashboard_overview IS 'Dashboard Overview page - Executive summary KPIs';

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
