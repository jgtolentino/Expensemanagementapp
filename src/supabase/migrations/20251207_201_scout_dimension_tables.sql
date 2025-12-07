-- =====================================================================
-- Scout Dashboard - Migration 2: Dimension Tables
-- =====================================================================
-- Purpose: Create stores, customers, products, brands dimensions
-- Dependencies: 20251207_200_scout_core_schema.sql
-- Author: TBWA Agency Databank
-- Date: 2025-12-07
-- =====================================================================

-- =====================================================================
-- TABLE: scout.stores
-- =====================================================================

CREATE TABLE scout.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  store_code varchar(50) NOT NULL,
  store_name varchar(200) NOT NULL,
  store_type scout.store_type_enum NOT NULL DEFAULT 'sari_sari',
  
  -- Geography (EXPLICIT Philippine Hierarchy)
  barangay varchar(100),
  city varchar(100) NOT NULL,
  province varchar(100) NOT NULL,
  region varchar(100) NOT NULL,
  region_code varchar(10) NOT NULL,
  island_group scout.island_group_enum NOT NULL,
  
  -- Coordinates
  latitude numeric(10,7),
  longitude numeric(10,7),
  
  -- Store Attributes
  status scout.status_enum NOT NULL DEFAULT 'active',
  population_density scout.population_density_enum,
  urban_rural scout.urban_rural_enum NOT NULL DEFAULT 'urban',
  
  -- Metadata
  opened_date date,
  owner_name varchar(200),
  contact_number varchar(20),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_stores_tenant_code UNIQUE (tenant_id, store_code)
);

-- Indexes
CREATE INDEX idx_stores_tenant ON scout.stores(tenant_id);
CREATE INDEX idx_stores_code ON scout.stores(store_code);
CREATE INDEX idx_stores_region ON scout.stores(region_code);
CREATE INDEX idx_stores_city ON scout.stores(city);
CREATE INDEX idx_stores_type ON scout.stores(store_type);
CREATE INDEX idx_stores_status ON scout.stores(status);
CREATE INDEX idx_stores_urban_rural ON scout.stores(urban_rural);
CREATE INDEX idx_stores_island_group ON scout.stores(island_group);

-- Comments
COMMENT ON TABLE scout.stores IS 'Store master data with Philippine geography hierarchy';
COMMENT ON COLUMN scout.stores.region_code IS 'Philippine region code (NCR, I, II, III, IVA, IVB, V, VI, VII, VIII, IX, X, XI, XII, XIII, CAR, BARMM, MIMAROPA)';

-- =====================================================================
-- TABLE: scout.brands
-- =====================================================================

CREATE TABLE scout.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  brand_code varchar(50) NOT NULL,
  brand_name varchar(100) NOT NULL,
  manufacturer varchar(200),
  primary_category scout.product_category_enum,
  is_local_brand boolean NOT NULL DEFAULT false,
  status scout.status_enum NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_brands_tenant_code UNIQUE (tenant_id, brand_code)
);

-- Indexes
CREATE INDEX idx_brands_tenant ON scout.brands(tenant_id);
CREATE INDEX idx_brands_name ON scout.brands(brand_name);
CREATE INDEX idx_brands_category ON scout.brands(primary_category);
CREATE INDEX idx_brands_local ON scout.brands(is_local_brand);
CREATE INDEX idx_brands_status ON scout.brands(status);

-- Comments
COMMENT ON TABLE scout.brands IS 'Brand master data';
COMMENT ON COLUMN scout.brands.is_local_brand IS 'True if Philippine brand';

-- =====================================================================
-- TABLE: scout.products
-- =====================================================================

CREATE TABLE scout.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  sku varchar(50) NOT NULL,
  product_name varchar(200) NOT NULL,
  brand_id uuid NOT NULL REFERENCES scout.brands(id),
  brand_name varchar(100) NOT NULL,  -- Denormalized for performance
  product_category scout.product_category_enum NOT NULL,
  product_subcategory varchar(100),
  pack_size varchar(50),
  unit_of_measure varchar(20),
  is_tobacco boolean NOT NULL DEFAULT false,
  is_alcoholic boolean NOT NULL DEFAULT false,
  status scout.status_enum NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_products_tenant_sku UNIQUE (tenant_id, sku)
);

-- Indexes
CREATE INDEX idx_products_tenant ON scout.products(tenant_id);
CREATE INDEX idx_products_brand ON scout.products(brand_id);
CREATE INDEX idx_products_category ON scout.products(product_category);
CREATE INDEX idx_products_subcategory ON scout.products(product_subcategory);
CREATE INDEX idx_products_status ON scout.products(status);
CREATE INDEX idx_products_tobacco ON scout.products(is_tobacco);
CREATE INDEX idx_products_sku ON scout.products(sku);

-- Comments
COMMENT ON TABLE scout.products IS 'Product/SKU master data';
COMMENT ON COLUMN scout.products.brand_name IS 'Denormalized brand name for query performance';

-- =====================================================================
-- TABLE: scout.customers
-- =====================================================================

CREATE TABLE scout.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  customer_code varchar(50),
  
  -- Demographics (EXPLICIT First-Class)
  gender scout.gender_enum NOT NULL DEFAULT 'unknown',
  age_bracket scout.age_bracket_enum NOT NULL DEFAULT 'unknown',
  estimated_age smallint,
  
  -- Segmentation (EXPLICIT)
  income_segment scout.income_segment_enum NOT NULL DEFAULT 'unknown',
  urban_rural scout.urban_rural_enum NOT NULL DEFAULT 'unknown',
  
  -- Home Location (if different from store)
  home_barangay varchar(100),
  home_city varchar(100),
  home_province varchar(100),
  home_region varchar(100),
  
  -- Behavioral Flags
  is_repeat_customer boolean NOT NULL DEFAULT false,
  first_transaction_date date,
  last_transaction_date date,
  total_transactions int NOT NULL DEFAULT 0,
  lifetime_value numeric(10,2) NOT NULL DEFAULT 0,
  
  -- Privacy Flags
  is_anonymous boolean NOT NULL DEFAULT false,
  consent_recorded boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_customers_tenant ON scout.customers(tenant_id);
CREATE INDEX idx_customers_gender ON scout.customers(gender);
CREATE INDEX idx_customers_age_bracket ON scout.customers(age_bracket);
CREATE INDEX idx_customers_income_segment ON scout.customers(income_segment);
CREATE INDEX idx_customers_urban_rural ON scout.customers(urban_rural);
CREATE INDEX idx_customers_repeat ON scout.customers(is_repeat_customer);
CREATE INDEX idx_customers_home_region ON scout.customers(home_region);
CREATE INDEX idx_customers_code ON scout.customers(customer_code);

-- Comments
COMMENT ON TABLE scout.customers IS 'Customer profiles with explicit demographics';
COMMENT ON COLUMN scout.customers.gender IS 'EXPLICIT first-class field for profiling';
COMMENT ON COLUMN scout.customers.age_bracket IS 'EXPLICIT first-class field for profiling';
COMMENT ON COLUMN scout.customers.income_segment IS 'EXPLICIT first-class field for segmentation';

-- =====================================================================
-- TRIGGERS (Updated At)
-- =====================================================================

-- Stores
CREATE OR REPLACE FUNCTION scout.update_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON scout.stores
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_stores_updated_at();

-- Brands
CREATE OR REPLACE FUNCTION scout.update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON scout.brands
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_brands_updated_at();

-- Products
CREATE OR REPLACE FUNCTION scout.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON scout.products
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_products_updated_at();

-- Customers
CREATE OR REPLACE FUNCTION scout.update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON scout.customers
  FOR EACH ROW
  EXECUTE FUNCTION scout.update_customers_updated_at();

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT SELECT ON scout.stores TO authenticated;
GRANT SELECT ON scout.brands TO authenticated;
GRANT SELECT ON scout.products TO authenticated;
GRANT SELECT ON scout.customers TO authenticated;

GRANT ALL ON scout.stores TO service_role;
GRANT ALL ON scout.brands TO service_role;
GRANT ALL ON scout.products TO service_role;
GRANT ALL ON scout.customers TO service_role;

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
