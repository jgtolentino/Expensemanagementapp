-- =====================================================================
-- Scout Dashboard - Migration 3: Fact Tables
-- =====================================================================
-- Purpose: Create transactions (item-level) and baskets (aggregate) tables
-- Dependencies: 20251207_201_scout_dimension_tables.sql
-- Author: TBWA Agency Databank
-- Date: 2025-12-07
-- =====================================================================

-- =====================================================================
-- TABLE: scout.transactions (Item-Level Grain)
-- =====================================================================

CREATE TABLE scout.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  
  -- Keys
  basket_id uuid NOT NULL,  -- Multiple items share same basket_id
  store_id uuid NOT NULL REFERENCES scout.stores(id),
  customer_id uuid REFERENCES scout.customers(id),  -- Nullable for privacy
  product_id uuid NOT NULL REFERENCES scout.products(id),
  brand_id uuid NOT NULL REFERENCES scout.brands(id),
  
  -- Timestamp
  timestamp timestamptz NOT NULL,
  time_of_day scout.time_of_day_enum NOT NULL,
  is_weekend boolean NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Geography (Store Location)
  barangay varchar(100),
  city varchar(100) NOT NULL,
  province varchar(100) NOT NULL,
  region varchar(100) NOT NULL,
  island_group scout.island_group_enum NOT NULL,
  
  -- Product Details
  sku varchar(50) NOT NULL,
  product_name varchar(200) NOT NULL,
  product_category scout.product_category_enum NOT NULL,
  product_subcategory varchar(100),
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  line_amount numeric(10,2) NOT NULL CHECK (line_amount >= 0),
  
  -- Substitution Tracking (EXPLICIT)
  is_substituted boolean NOT NULL DEFAULT false,
  original_product_id uuid REFERENCES scout.products(id),
  original_brand_id uuid REFERENCES scout.brands(id),
  substitution_reason scout.substitution_reason_enum,
  
  -- Request & Behavior (EXPLICIT)
  request_type scout.request_type_enum NOT NULL,
  request_mode scout.request_mode_enum NOT NULL,
  store_suggestion_made boolean NOT NULL DEFAULT false,
  store_suggestion_accepted boolean,
  store_suggested_sku_id uuid REFERENCES scout.products(id),
  
  -- Transaction Dynamics (EXPLICIT)
  transaction_duration_seconds int NOT NULL CHECK (transaction_duration_seconds >= 0),
  item_sequence smallint NOT NULL CHECK (item_sequence > 0),
  
  -- Recording Metadata
  recording_id varchar(100),
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_tenant ON scout.transactions(tenant_id);
CREATE INDEX idx_transactions_timestamp ON scout.transactions(timestamp DESC);
CREATE INDEX idx_transactions_basket ON scout.transactions(basket_id);
CREATE INDEX idx_transactions_store ON scout.transactions(store_id);
CREATE INDEX idx_transactions_customer ON scout.transactions(customer_id);
CREATE INDEX idx_transactions_product ON scout.transactions(product_id);
CREATE INDEX idx_transactions_brand ON scout.transactions(brand_id);
CREATE INDEX idx_transactions_region_category ON scout.transactions(region, product_category);
CREATE INDEX idx_transactions_substitution ON scout.transactions(is_substituted, original_product_id) WHERE is_substituted = true;
CREATE INDEX idx_transactions_suggestion ON scout.transactions(store_suggestion_made, store_suggestion_accepted);
CREATE INDEX idx_transactions_time_of_day ON scout.transactions(time_of_day, is_weekend);
CREATE INDEX idx_transactions_request_type ON scout.transactions(request_type);
CREATE INDEX idx_transactions_request_mode ON scout.transactions(request_mode);

-- Comments
COMMENT ON TABLE scout.transactions IS 'Item-level transaction fact table with EXPLICIT behavior and profiling fields';
COMMENT ON COLUMN scout.transactions.basket_id IS 'Shared by all items in the same basket';
COMMENT ON COLUMN scout.transactions.is_substituted IS 'EXPLICIT: True if this is a substitute product';
COMMENT ON COLUMN scout.transactions.request_type IS 'EXPLICIT: branded/unbranded/unsure request classification';
COMMENT ON COLUMN scout.transactions.request_mode IS 'EXPLICIT: verbal/pointing/indirect communication mode';
COMMENT ON COLUMN scout.transactions.transaction_duration_seconds IS 'EXPLICIT: Total duration from start to purchase';

-- =====================================================================
-- TABLE: scout.baskets (Basket-Level Aggregates)
-- =====================================================================

CREATE TABLE scout.baskets (
  id uuid PRIMARY KEY,  -- Same as basket_id in transactions
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES scout.stores(id),
  customer_id uuid REFERENCES scout.customers(id),
  timestamp timestamptz NOT NULL,
  time_of_day scout.time_of_day_enum NOT NULL,
  is_weekend boolean NOT NULL,
  
  -- Basket Metrics (EXPLICIT)
  item_count int NOT NULL CHECK (item_count > 0),
  total_units int NOT NULL CHECK (total_units > 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  avg_price_per_item numeric(10,2) NOT NULL CHECK (avg_price_per_item >= 0),
  
  -- Basket Dynamics (EXPLICIT)
  duration_seconds int NOT NULL CHECK (duration_seconds >= 0),
  is_impulse boolean NOT NULL DEFAULT false,
  has_substitution boolean NOT NULL DEFAULT false,
  has_store_suggestion boolean NOT NULL DEFAULT false,
  suggestion_acceptance_count int NOT NULL DEFAULT 0,
  
  -- Category Mix
  category_count int NOT NULL CHECK (category_count > 0),
  categories text[] NOT NULL,
  
  -- Geography
  region varchar(100) NOT NULL,
  province varchar(100) NOT NULL,
  city varchar(100) NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_baskets_tenant ON scout.baskets(tenant_id);
CREATE INDEX idx_baskets_timestamp ON scout.baskets(timestamp DESC);
CREATE INDEX idx_baskets_store ON scout.baskets(store_id);
CREATE INDEX idx_baskets_customer ON scout.baskets(customer_id);
CREATE INDEX idx_baskets_item_count ON scout.baskets(item_count);
CREATE INDEX idx_baskets_duration ON scout.baskets(duration_seconds);
CREATE INDEX idx_baskets_impulse ON scout.baskets(is_impulse);
CREATE INDEX idx_baskets_region ON scout.baskets(region);

-- Comments
COMMENT ON TABLE scout.baskets IS 'Basket-level aggregates for fast querying';
COMMENT ON COLUMN scout.baskets.is_impulse IS 'EXPLICIT: True if duration < 120 seconds';

-- =====================================================================
-- TRIGGER: Auto-populate baskets from transactions
-- =====================================================================

CREATE OR REPLACE FUNCTION scout.upsert_basket_from_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_basket scout.baskets%ROWTYPE;
BEGIN
  -- Aggregate basket metrics from all transactions with this basket_id
  SELECT
    NEW.basket_id,
    NEW.tenant_id,
    NEW.store_id,
    NEW.customer_id,
    MIN(timestamp),
    MIN(time_of_day),
    MIN(is_weekend),
    COUNT(DISTINCT product_id),
    SUM(quantity),
    SUM(line_amount),
    AVG(unit_price),
    MAX(transaction_duration_seconds),
    CASE WHEN MAX(transaction_duration_seconds) < 120 THEN true ELSE false END,
    BOOL_OR(is_substituted),
    BOOL_OR(store_suggestion_made),
    SUM(CASE WHEN store_suggestion_accepted THEN 1 ELSE 0 END),
    COUNT(DISTINCT product_category),
    ARRAY_AGG(DISTINCT product_category),
    MIN(region),
    MIN(province),
    MIN(city),
    now(),
    now()
  INTO v_basket
  FROM scout.transactions
  WHERE basket_id = NEW.basket_id
  GROUP BY basket_id;
  
  -- Upsert basket
  INSERT INTO scout.baskets VALUES (v_basket.*)
  ON CONFLICT (id) DO UPDATE SET
    item_count = EXCLUDED.item_count,
    total_units = EXCLUDED.total_units,
    total_amount = EXCLUDED.total_amount,
    avg_price_per_item = EXCLUDED.avg_price_per_item,
    duration_seconds = EXCLUDED.duration_seconds,
    is_impulse = EXCLUDED.is_impulse,
    has_substitution = EXCLUDED.has_substitution,
    has_store_suggestion = EXCLUDED.has_store_suggestion,
    suggestion_acceptance_count = EXCLUDED.suggestion_acceptance_count,
    category_count = EXCLUDED.category_count,
    categories = EXCLUDED.categories,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_upsert_basket
  AFTER INSERT OR UPDATE ON scout.transactions
  FOR EACH ROW
  EXECUTE FUNCTION scout.upsert_basket_from_transaction();

-- =====================================================================
-- TRIGGER: Update customer stats
-- =====================================================================

CREATE OR REPLACE FUNCTION scout.update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer lifetime stats
  UPDATE scout.customers
  SET
    is_repeat_customer = (
      SELECT COUNT(DISTINCT basket_id) > 1
      FROM scout.transactions
      WHERE customer_id = NEW.customer_id
    ),
    first_transaction_date = (
      SELECT MIN(DATE(timestamp))
      FROM scout.transactions
      WHERE customer_id = NEW.customer_id
    ),
    last_transaction_date = (
      SELECT MAX(DATE(timestamp))
      FROM scout.transactions
      WHERE customer_id = NEW.customer_id
    ),
    total_transactions = (
      SELECT COUNT(DISTINCT basket_id)
      FROM scout.transactions
      WHERE customer_id = NEW.customer_id
    ),
    lifetime_value = (
      SELECT SUM(line_amount)
      FROM scout.transactions
      WHERE customer_id = NEW.customer_id
    ),
    updated_at = now()
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_update_customer
  AFTER INSERT ON scout.transactions
  FOR EACH ROW
  WHEN (NEW.customer_id IS NOT NULL)
  EXECUTE FUNCTION scout.update_customer_stats();

-- =====================================================================
-- TRIGGERS (Updated At)
-- =====================================================================

CREATE OR REPLACE FUNCTION scout.update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON scout.transactions
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_transactions_updated_at();

CREATE OR REPLACE FUNCTION scout.update_baskets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_baskets_updated_at
  BEFORE UPDATE ON scout.baskets
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_baskets_updated_at();

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT ON scout.transactions TO authenticated;
GRANT SELECT ON scout.baskets TO authenticated;

GRANT ALL ON scout.transactions TO service_role;
GRANT ALL ON scout.baskets TO service_role;

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
