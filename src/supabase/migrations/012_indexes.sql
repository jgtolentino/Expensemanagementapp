-- ============================================================================
-- Scout Dashboard - Index & Retrieval Optimization (Layer 6)
-- Migration 012
-- 
-- Purpose:
-- - OLTP indexes (fast dashboard queries)
-- - OLAP indexes (analytics aggregations)
-- - Vector indexes (RAG/AI similarity search)
-- - Full-text search (product/brand search)
-- 
-- Index Strategy:
-- - B-tree: Range queries (timestamp, numeric filters)
-- - Hash: Exact lookups (UUIDs, primary keys)
-- - GiST/GIN: Full-text search, JSON queries
-- - HNSW/IVF: Vector similarity (pgvector)
-- 
-- Created: 2025-12-07
-- ============================================================================

-- ============================================================================
-- 1. OLTP INDEXES (Dashboard Queries)
-- ============================================================================

-- Transactions: store + date range (most common query pattern)
create index if not exists idx_transactions_store_date
  on scout.transactions (store_id, timestamp desc)
  where tenant_id is not null;

comment on index scout.idx_transactions_store_date is 'Fast store + date range queries for dashboards';

-- Transactions: SKU + date range (product performance)
create index if not exists idx_transactions_sku_date
  on scout.transactions (product_id, timestamp desc)
  where tenant_id is not null;

comment on index scout.idx_transactions_sku_date is 'Fast SKU + date range queries for product analytics';

-- Transactions: basket rollup (basket composition queries)
create index if not exists idx_transactions_basket
  on scout.transactions (basket_id)
  where tenant_id is not null;

comment on index scout.idx_transactions_basket is 'Fast basket rollup queries';

-- Transactions: category + date (category mix queries)
create index if not exists idx_transactions_category_date
  on scout.transactions (product_category, timestamp desc)
  where tenant_id is not null;

comment on index scout.idx_transactions_category_date is 'Fast category + date range queries';

-- Transactions: brand + date (brand performance)
create index if not exists idx_transactions_brand_date
  on scout.transactions (brand_id, timestamp desc)
  where tenant_id is not null;

comment on index scout.idx_transactions_brand_date is 'Fast brand + date range queries';

-- Transactions: region + date (geo intelligence)
create index if not exists idx_transactions_region_date
  on scout.transactions (region, timestamp desc)
  where tenant_id is not null;

comment on index scout.idx_transactions_region_date is 'Fast regional performance queries';

-- Transactions: time_of_day (behavior analysis)
create index if not exists idx_transactions_time_of_day
  on scout.transactions (time_of_day)
  where tenant_id is not null and time_of_day is not null;

comment on index scout.idx_transactions_time_of_day is 'Fast time-of-day behavior queries';

-- ============================================================================
-- 2. OLTP INDEXES (Customers & Stores)
-- ============================================================================

-- Customers: store + demographics (segmentation queries)
create index if not exists idx_customers_store_gender_age
  on scout.customers (store_id, gender, age_bracket)
  where tenant_id is not null;

comment on index scout.idx_customers_store_gender_age is 'Fast customer segmentation queries';

-- Customers: income segment (profiling queries)
create index if not exists idx_customers_income_segment
  on scout.customers (income_segment)
  where tenant_id is not null and income_segment is not null;

comment on index scout.idx_customers_income_segment is 'Fast income segment queries';

-- Customers: email hash (lookup by email)
create index if not exists idx_customers_email_hash
  on scout.customers (email_hash)
  where email_hash is not null;

comment on index scout.idx_customers_email_hash is 'Fast customer lookup by hashed email';

-- Stores: region + city (geo drilldowns)
create index if not exists idx_stores_region_city
  on scout.stores (region, city)
  where tenant_id is not null;

comment on index scout.idx_stores_region_city is 'Fast regional + city drilldowns';

-- Stores: type (sari-sari vs convenience)
create index if not exists idx_stores_type
  on scout.stores (store_type)
  where tenant_id is not null;

comment on index scout.idx_stores_type is 'Fast store type filtering';

-- Stores: urban/rural (demographics)
create index if not exists idx_stores_urban_rural
  on scout.stores (urban_rural)
  where tenant_id is not null and urban_rural is not null;

comment on index scout.idx_stores_urban_rural is 'Fast urban/rural filtering';

-- ============================================================================
-- 3. OLTP INDEXES (Products & Brands)
-- ============================================================================

-- Products: brand (product mix by brand)
create index if not exists idx_products_brand
  on scout.products (brand_id)
  where tenant_id is not null;

comment on index scout.idx_products_brand is 'Fast product filtering by brand';

-- Products: category (product mix by category)
create index if not exists idx_products_category
  on scout.products (category)
  where tenant_id is not null;

comment on index scout.idx_products_category is 'Fast product filtering by category';

-- Products: SKU (exact lookup)
create index if not exists idx_products_sku
  on scout.products (sku)
  where tenant_id is not null;

comment on index scout.idx_products_sku is 'Fast SKU exact match';

-- Brands: name (brand search)
create index if not exists idx_brands_name
  on scout.brands (name)
  where tenant_id is not null;

comment on index scout.idx_brands_name is 'Fast brand name search';

-- ============================================================================
-- 4. OLAP INDEXES (Baskets)
-- ============================================================================

-- Baskets: store + date (basket trends)
create index if not exists idx_baskets_store_date
  on scout.baskets (store_id, start_ts desc)
  where tenant_id is not null;

comment on index scout.idx_baskets_store_date is 'Fast basket trends by store';

-- Baskets: customer (customer lifetime value)
create index if not exists idx_baskets_customer
  on scout.baskets (customer_id)
  where tenant_id is not null and customer_id is not null;

comment on index scout.idx_baskets_customer is 'Fast customer lifetime value queries';

-- Baskets: is_impulse (impulse purchase analysis)
create index if not exists idx_baskets_impulse
  on scout.baskets (is_impulse)
  where tenant_id is not null and is_impulse = true;

comment on index scout.idx_baskets_impulse is 'Fast impulse purchase queries';

-- ============================================================================
-- 5. OLAP INDEXES (Substitutions)
-- ============================================================================

-- Substitutions: original brand (substitution flows)
create index if not exists idx_substitutions_original_brand
  on scout.substitutions (original_brand_id)
  where tenant_id is not null;

comment on index scout.idx_substitutions_original_brand is 'Fast substitution flow queries (from brand)';

-- Substitutions: substitute brand (substitution flows)
create index if not exists idx_substitutions_substitute_brand
  on scout.substitutions (substitute_brand_id)
  where tenant_id is not null;

comment on index scout.idx_substitutions_substitute_brand is 'Fast substitution flow queries (to brand)';

-- Substitutions: reason (out-of-stock analysis)
create index if not exists idx_substitutions_reason
  on scout.substitutions (reason)
  where tenant_id is not null;

comment on index scout.idx_substitutions_reason is 'Fast substitution reason analysis';

-- ============================================================================
-- 6. VECTOR INDEXES (RAG/AI)
-- ============================================================================

-- Knowledge chunks: vector similarity (HNSW for fast approximate nearest neighbor)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'scout' and table_name = 'knowledge_chunks'
  ) then
    -- Drop existing vector index if it exists
    drop index if exists scout.idx_knowledge_chunks_embedding;
    
    -- Create HNSW index (best for high-dimensional vectors)
    create index if not exists idx_knowledge_chunks_embedding_hnsw
      on scout.knowledge_chunks
      using hnsw (embedding vector_cosine_ops)
      with (m = 16, ef_construction = 64);
    
    -- Alternative: IVF index (better for very large datasets)
    -- create index idx_knowledge_chunks_embedding_ivf
    --   on scout.knowledge_chunks
    --   using ivfflat (embedding vector_cosine_ops)
    --   with (lists = 100);
  end if;
end $$;

comment on index scout.idx_knowledge_chunks_embedding_hnsw is 'HNSW vector index for RAG similarity search (m=16, ef_construction=64)';

-- Knowledge chunks: tenant + role filtering (security)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'scout' and table_name = 'knowledge_chunks'
  ) then
    create index if not exists idx_knowledge_chunks_tenant_role
      on scout.knowledge_chunks (tenant_id, required_role)
      where tenant_id is not null;
  end if;
end $$;

-- ============================================================================
-- 7. FULL-TEXT SEARCH (Products & Brands)
-- ============================================================================

-- Add tsvector column for product name search
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'products' and column_name = 'name_search'
  ) then
    alter table scout.products add column name_search tsvector
      generated always as (to_tsvector('english', coalesce(product_name, ''))) stored;
    
    create index idx_products_name_search
      on scout.products using gin (name_search);
  end if;
end $$;

comment on index scout.idx_products_name_search is 'Full-text search on product names';

-- Add tsvector column for brand name search
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'scout' and table_name = 'brands' and column_name = 'name_search'
  ) then
    alter table scout.brands add column name_search tsvector
      generated always as (to_tsvector('english', coalesce(name, ''))) stored;
    
    create index idx_brands_name_search
      on scout.brands using gin (name_search);
  end if;
end $$;

comment on index scout.idx_brands_name_search is 'Full-text search on brand names';

-- ============================================================================
-- 8. COMPOSITE INDEXES (Multi-Column Queries)
-- ============================================================================

-- Transactions: tenant + store + date (most restrictive query)
create index if not exists idx_transactions_tenant_store_date
  on scout.transactions (tenant_id, store_id, timestamp desc);

comment on index scout.idx_transactions_tenant_store_date is 'Composite index for tenant + store + date queries';

-- Customers: tenant + store + gender + age
create index if not exists idx_customers_tenant_store_demographics
  on scout.customers (tenant_id, store_id, gender, age_bracket);

comment on index scout.idx_customers_tenant_store_demographics is 'Composite index for demographic queries';

-- ============================================================================
-- 9. PARTIAL INDEXES (Filtered Queries)
-- ============================================================================

-- Transactions: only suggested items (for suggestion acceptance analysis)
create index if not exists idx_transactions_suggestion_made
  on scout.transactions (timestamp desc)
  where tenant_id is not null and suggestion_made = true;

comment on index scout.idx_transactions_suggestion_made is 'Partial index for suggestion analysis';

-- Transactions: only substitutions (for substitution analysis)
create index if not exists idx_transactions_substitution_occurred
  on scout.transactions (timestamp desc)
  where tenant_id is not null and substitution_occurred = true;

comment on index scout.idx_transactions_substitution_occurred is 'Partial index for substitution analysis';

-- Stores: only active stores
create index if not exists idx_stores_active
  on scout.stores (region, city)
  where tenant_id is not null and status = 'active';

comment on index scout.idx_stores_active is 'Partial index for active stores';

-- ============================================================================
-- 10. JSONB INDEXES (Metadata Queries)
-- ============================================================================

-- User roles: metadata (for brand_ids, store_ids filtering)
create index if not exists idx_user_roles_metadata
  on scout.user_roles using gin (metadata);

comment on index scout.idx_user_roles_metadata is 'GIN index for JSONB metadata queries';

-- Tenants: settings (for feature flag queries)
create index if not exists idx_tenants_settings
  on scout.tenants using gin (settings);

comment on index scout.idx_tenants_settings is 'GIN index for tenant settings queries';

-- ============================================================================
-- 11. COVERING INDEXES (Index-Only Scans)
-- ============================================================================

-- Transactions: include line_amount for revenue aggregations
create index if not exists idx_transactions_store_date_revenue
  on scout.transactions (store_id, timestamp desc)
  include (line_amount)
  where tenant_id is not null;

comment on index scout.idx_transactions_store_date_revenue is 'Covering index for revenue queries (index-only scan)';

-- Transactions: include quantity for volume queries
create index if not exists idx_transactions_sku_date_volume
  on scout.transactions (product_id, timestamp desc)
  include (quantity)
  where tenant_id is not null;

comment on index scout.idx_transactions_sku_date_volume is 'Covering index for volume queries (index-only scan)';

-- ============================================================================
-- 12. INDEX STATISTICS & MAINTENANCE
-- ============================================================================

-- Analyze all scout tables to update statistics
analyze scout.stores;
analyze scout.customers;
analyze scout.products;
analyze scout.brands;
analyze scout.transactions;
analyze scout.baskets;
analyze scout.substitutions;

-- Reindex (if needed after large data loads)
-- reindex schema scout;

-- ============================================================================
-- 13. QUERY PERFORMANCE VALIDATION
-- ============================================================================

-- Verify all critical indexes exist
do $$
declare
  missing_indexes text[];
  expected_indexes text[] := array[
    'idx_transactions_store_date',
    'idx_transactions_sku_date',
    'idx_transactions_basket',
    'idx_customers_store_gender_age',
    'idx_stores_region_city',
    'idx_products_brand',
    'idx_baskets_store_date'
  ];
  idx text;
begin
  foreach idx in array expected_indexes
  loop
    if not exists (
      select 1 from pg_indexes
      where schemaname = 'scout' and indexname = idx
    ) then
      missing_indexes := array_append(missing_indexes, idx);
    end if;
  end loop;
  
  if array_length(missing_indexes, 1) > 0 then
    raise warning 'Missing critical indexes: %', missing_indexes;
  else
    raise notice 'All critical indexes created successfully ✅';
  end if;
end $$;

-- ============================================================================
-- 14. INDEX USAGE MONITORING (Helper View)
-- ============================================================================

-- Create view to monitor index usage
create or replace view scout.index_usage_stats as
select
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
from pg_stat_user_indexes
where schemaname = 'scout'
order by idx_scan desc;

comment on view scout.index_usage_stats is 'Monitor index usage statistics';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Display index summary
do $$
declare
  index_count integer;
  total_size text;
begin
  select count(*), pg_size_pretty(sum(pg_relation_size(indexrelid)))
  into index_count, total_size
  from pg_stat_user_indexes
  where schemaname = 'scout';
  
  raise notice 'Scout indexes: % total, % disk space', index_count, total_size;
end $$;
