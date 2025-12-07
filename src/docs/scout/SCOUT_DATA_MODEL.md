# Scout Dashboard - Data Model (Phase 2)

**Date:** 2025-12-07  
**Phase:** 2 - Canonical Data Model  
**Completeness:** ALL dashboard fields as first-class columns

---

## Design Principles

### 1. Explicit > Implicit
**Every dashboard metric must be directly queryable from a column or view.**

- ❌ NO: "Duration can be computed from start/end timestamps"
- ✅ YES: `duration_seconds` column on `scout.transactions`

### 2. Transaction Grain
**Grain:** One row per **item** in a basket (not per basket).

- Multiple items = Multiple rows with same `basket_id`
- Single item = One row with unique `basket_id`

### 3. Multi-Tenant Isolation
**All tables include `tenant_id`** for RLS policies.

### 4. Philippine Context
**Geography:** Full Philippine admin hierarchy (Island Group → Region → Province → City → Barangay).

---

## Schema: `scout`

### Core Tables (6)

1. `scout.transactions` - Fact table (transaction items)
2. `scout.baskets` - Basket-level aggregates
3. `scout.stores` - Store dimension
4. `scout.customers` - Customer profiles (with demographics)
5. `scout.products` - Product/SKU master
6. `scout.brands` - Brand dimension

### Analytics Views (7)

7. `scout.v_transaction_trends` - Time series metrics
8. `scout.v_product_mix` - Category/SKU performance
9. `scout.v_substitution_flows` - Product substitution patterns
10. `scout.v_consumer_behavior` - Request types, acceptance rates
11. `scout.v_consumer_profiling` - Demographics breakdowns
12. `scout.v_geo_intelligence` - Regional performance
13. `scout.v_dashboard_overview` - Executive summary KPIs

### AI/RAG Tables (4)

14. `scout.recommendations` - SariCoach AI recommendations
15. `scout.knowledge_documents` - Knowledge base
16. `scout.knowledge_chunks` - Vector embeddings
17. `scout.ai_conversations` - Chat sessions
18. `scout.ai_messages` - Chat history

---

## Table 1: `scout.transactions` (Fact Table)

### Purpose
**Item-level transaction grain** capturing every SKU purchased, with full context: duration, request method, suggestion acceptance, demographics.

### Grain
**One row per item** in a basket. A 3-item basket = 3 rows with same `basket_id`.

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key | `a1b2c3d4...` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant isolation |
| **basket_id** | uuid | No | Basket identifier (multiple items share) | `basket-456` | Basket analysis |
| **store_id** | uuid | No | FK to scout.stores | `store-789` | Store filtering |
| **customer_id** | uuid | Yes | FK to scout.customers | `cust-012` | Profiling (nullable for privacy) |
| **product_id** | uuid | No | FK to scout.products | `prod-345` | Product analysis |
| **brand_id** | uuid | No | FK to scout.brands | `brand-678` | Brand filtering |
| **timestamp** | timestamptz | No | Transaction datetime (UTC) | `2025-12-07 06:32:15+00` | Trends |
| **time_of_day** | time_of_day_enum | No | Morning/Afternoon/Evening/Night | `morning` | Time analysis |
| **is_weekend** | boolean | No | True if Sat/Sun | `false` | Day-of-week analysis |
| **day_of_week** | smallint | No | 0=Sun, 1=Mon, ..., 6=Sat | `6` | Weekly patterns |
| | | | | | |
| **-- Geography (Store Location) --** | | | | | |
| **barangay** | varchar(100) | Yes | Barangay name | `Barangay 123` | Geo filtering |
| **city** | varchar(100) | No | City/Municipality | `Quezon City` | Regional analysis |
| **province** | varchar(100) | No | Province | `Metro Manila` | Provincial trends |
| **region** | varchar(100) | No | Region | `NCR` | Regional dashboard |
| **island_group** | island_group_enum | No | Luzon/Visayas/Mindanao | `Luzon` | Island-level analysis |
| | | | | | |
| **-- Product Details --** | | | | | |
| **sku** | varchar(50) | No | Product SKU code | `COKE-1L-PET` | SKU filtering |
| **product_name** | varchar(200) | No | Product name | `Coca-Cola 1L PET` | Display |
| **product_category** | product_category_enum | No | Category | `beverage` | Category analysis |
| **product_subcategory** | varchar(100) | Yes | Subcategory | `Soft Drinks` | Subcategory filtering |
| **quantity** | int | No | Units purchased | `2` | Units per transaction |
| **unit_price** | numeric(10,2) | No | Price per unit (₱) | `45.00` | Pricing analysis |
| **line_amount** | numeric(10,2) | No | Total for this line (qty × price) | `90.00` | Revenue per item |
| | | | | | |
| **-- Substitution Tracking (EXPLICIT) --** | | | | | |
| **is_substituted** | boolean | No | True if this is a substitute | `false` | Substitution analysis |
| **original_product_id** | uuid | Yes | FK to scout.products (what was requested) | `prod-999` | Substitution flows |
| **original_brand_id** | uuid | Yes | FK to scout.brands (what was requested) | `brand-888` | Brand switching |
| **substitution_reason** | substitution_reason_enum | Yes | out_of_stock, price, preference, storeowner_suggestion | `out_of_stock` | Reason analysis |
| | | | | | |
| **-- Request & Behavior (EXPLICIT) --** | | | | | |
| **request_type** | request_type_enum | No | branded, unbranded, unsure | `branded` | Request breakdown |
| **request_mode** | request_mode_enum | No | verbal, pointing, indirect | `verbal` | Mode analysis |
| **store_suggestion_made** | boolean | No | True if storeowner suggested this | `false` | Suggestion tracking |
| **store_suggestion_accepted** | boolean | Yes | True if customer accepted suggestion | NULL | Acceptance rates |
| **store_suggested_sku_id** | uuid | Yes | FK to scout.products (what was suggested) | NULL | Suggestion performance |
| | | | | | |
| **-- Transaction Dynamics (EXPLICIT) --** | | | | | |
| **transaction_duration_seconds** | int | No | Total duration from start to purchase | `180` | Duration analysis |
| **item_sequence** | smallint | No | Order in basket (1st, 2nd, 3rd item) | `1` | Basket sequencing |
| | | | | | |
| **-- Recording Metadata --** | | | | | |
| **recording_id** | varchar(100) | Yes | Audio/video recording reference | `rec-20251207-001` | Audit trail |
| **confidence_score** | numeric(3,2) | Yes | AI transcription confidence (0-1) | `0.92` | Quality filtering |
| | | | | | |
| **-- Timestamps --** | | | | | |
| **created_at** | timestamptz | No | Record creation | `2025-12-07 06:35:00+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 06:35:00+00` | Audit |

### Indexes

```sql
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
```

### Foreign Keys

```sql
ALTER TABLE scout.transactions
  ADD CONSTRAINT fk_transactions_tenant FOREIGN KEY (tenant_id) REFERENCES core.tenants(id),
  ADD CONSTRAINT fk_transactions_store FOREIGN KEY (store_id) REFERENCES scout.stores(id),
  ADD CONSTRAINT fk_transactions_customer FOREIGN KEY (customer_id) REFERENCES scout.customers(id),
  ADD CONSTRAINT fk_transactions_product FOREIGN KEY (product_id) REFERENCES scout.products(id),
  ADD CONSTRAINT fk_transactions_brand FOREIGN KEY (brand_id) REFERENCES scout.brands(id),
  ADD CONSTRAINT fk_transactions_original_product FOREIGN KEY (original_product_id) REFERENCES scout.products(id),
  ADD CONSTRAINT fk_transactions_original_brand FOREIGN KEY (original_brand_id) REFERENCES scout.brands(id),
  ADD CONSTRAINT fk_transactions_suggested_sku FOREIGN KEY (store_suggested_sku_id) REFERENCES scout.products(id);
```

### Dashboard Mappings

**This table powers:**

| Dashboard Page | Metrics | Filters |
|----------------|---------|---------|
| **Transaction Trends** | Daily volume, revenue, duration, units per txn | time_of_day, is_weekend, region, category |
| **Product Mix** | Category distribution, SKU rankings | product_category, brand_id, region |
| **Consumer Behavior** | Request type breakdown, suggestion acceptance | request_type, request_mode, store_suggestion_made |
| **Consumer Profiling** | Demographics (via customer join) | customer demographics |
| **Geo Intelligence** | Regional revenue, store performance | region, province, city, island_group |

---

## Table 2: `scout.baskets` (Basket-Level Aggregates)

### Purpose
**Pre-aggregated basket metrics** for fast querying without scanning all transaction items.

### Grain
**One row per basket** (one-to-many with transactions).

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key (same as basket_id in transactions) | `basket-456` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant |
| **store_id** | uuid | No | FK to scout.stores | `store-789` | Store filtering |
| **customer_id** | uuid | Yes | FK to scout.customers | `cust-012` | Profiling |
| **timestamp** | timestamptz | No | Basket timestamp (first item) | `2025-12-07 06:32:15+00` | Trends |
| **time_of_day** | time_of_day_enum | No | Morning/Afternoon/Evening/Night | `morning` | Time analysis |
| **is_weekend** | boolean | No | True if Sat/Sun | `false` | Day-of-week |
| | | | | | |
| **-- Basket Metrics (EXPLICIT) --** | | | | | |
| **item_count** | int | No | Number of distinct SKUs | `3` | Basket size distribution |
| **total_units** | int | No | Total quantity across all items | `5` | Units per basket |
| **total_amount** | numeric(10,2) | No | Total basket value (₱) | `235.00` | Revenue per basket |
| **avg_price_per_item** | numeric(10,2) | No | total_amount / item_count | `78.33` | Average item price |
| | | | | | |
| **-- Basket Dynamics (EXPLICIT) --** | | | | | |
| **duration_seconds** | int | No | Total transaction time | `180` | Duration analysis |
| **is_impulse** | boolean | No | True if duration < 120 seconds | `false` | Impulse vs planned |
| **has_substitution** | boolean | No | True if any item was substituted | `false` | Substitution tracking |
| **has_store_suggestion** | boolean | No | True if any item was suggested | `false` | Suggestion tracking |
| **suggestion_acceptance_count** | int | No | How many suggestions accepted | `0` | Acceptance metrics |
| | | | | | |
| **-- Category Mix --** | | | | | |
| **category_count** | int | No | Distinct categories in basket | `2` | Cross-category analysis |
| **categories** | text[] | No | Array of categories | `{beverage,snacks}` | Category composition |
| | | | | | |
| **-- Geography --** | | | | | |
| **region** | varchar(100) | No | Region | `NCR` | Regional filtering |
| **province** | varchar(100) | No | Province | `Metro Manila` | Provincial filtering |
| **city** | varchar(100) | No | City | `Quezon City` | City filtering |
| | | | | | |
| **created_at** | timestamptz | No | Record creation | `2025-12-07 06:35:00+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 06:35:00+00` | Audit |

### Indexes

```sql
CREATE INDEX idx_baskets_tenant ON scout.baskets(tenant_id);
CREATE INDEX idx_baskets_timestamp ON scout.baskets(timestamp DESC);
CREATE INDEX idx_baskets_store ON scout.baskets(store_id);
CREATE INDEX idx_baskets_customer ON scout.baskets(customer_id);
CREATE INDEX idx_baskets_item_count ON scout.baskets(item_count);
CREATE INDEX idx_baskets_duration ON scout.baskets(duration_seconds);
CREATE INDEX idx_baskets_impulse ON scout.baskets(is_impulse);
CREATE INDEX idx_baskets_region ON scout.baskets(region);
```

### Dashboard Mappings

**This table powers:**

| Dashboard Page | Metrics | Filters |
|----------------|---------|---------|
| **Transaction Trends (Basket Size tab)** | Avg items per basket, basket distribution | item_count, total_amount |
| **Transaction Trends (Duration tab)** | Avg duration, impulse % | duration_seconds, is_impulse |
| **Product Mix (Basket Analysis tab)** | Cross-category rate, avg basket value | category_count, categories |
| **Consumer Behavior (Behavior Traits tab)** | Impulse vs planned | is_impulse, duration_seconds |

---

## Table 3: `scout.stores` (Dimension)

### Purpose
**Store master data** with full Philippine geography.

### Grain
**One row per store**.

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key | `store-789` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant |
| **store_code** | varchar(50) | No | Unique store code | `SM-QC-001` | Display |
| **store_name** | varchar(200) | No | Store name | `Sari-Sari Aling Nena` | Display |
| **store_type** | store_type_enum | No | sari_sari, mini_mart, supermarket, wholesaler | `sari_sari` | Type filtering |
| | | | | | |
| **-- Geography (EXPLICIT Philippine Hierarchy) --** | | | | | |
| **barangay** | varchar(100) | Yes | Barangay name | `Barangay Pinyahan` | Barangay filtering |
| **city** | varchar(100) | No | City/Municipality | `Quezon City` | City filtering |
| **province** | varchar(100) | No | Province | `Metro Manila` | Provincial filtering |
| **region** | varchar(100) | No | Region (official name) | `National Capital Region` | Regional filtering |
| **region_code** | varchar(10) | No | Region code (NCR, I, II, etc.) | `NCR` | Region code |
| **island_group** | island_group_enum | No | Luzon/Visayas/Mindanao | `Luzon` | Island filtering |
| | | | | | |
| **-- Coordinates --** | | | | | |
| **latitude** | numeric(10,7) | Yes | Latitude | `14.6760` | Mapping |
| **longitude** | numeric(10,7) | Yes | Longitude | `121.0437` | Mapping |
| | | | | | |
| **-- Store Attributes --** | | | | | |
| **status** | status_enum | No | active, inactive, temporarily_closed | `active` | Active filtering |
| **population_density** | population_density_enum | Yes | low, medium, high | `high` | Density analysis |
| **urban_rural** | urban_rural_enum | No | urban, rural | `urban` | Urban/rural filtering |
| | | | | | |
| **-- Metadata --** | | | | | |
| **opened_date** | date | Yes | Store opening date | `2024-03-15` | Age analysis |
| **owner_name** | varchar(200) | Yes | Storeowner name | `Nena Santos` | Owner tracking (privacy) |
| **contact_number** | varchar(20) | Yes | Phone | `+63 912 345 6789` | Contact |
| | | | | | |
| **created_at** | timestamptz | No | Record creation | `2024-03-15 00:00:00+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 06:00:00+00` | Audit |

### Indexes

```sql
CREATE INDEX idx_stores_tenant ON scout.stores(tenant_id);
CREATE INDEX idx_stores_code ON scout.stores(store_code);
CREATE INDEX idx_stores_region ON scout.stores(region_code);
CREATE INDEX idx_stores_city ON scout.stores(city);
CREATE INDEX idx_stores_type ON scout.stores(store_type);
CREATE INDEX idx_stores_status ON scout.stores(status);
CREATE INDEX idx_stores_urban_rural ON scout.stores(urban_rural);
CREATE INDEX idx_stores_location ON scout.stores USING GIST (ST_MakePoint(longitude, latitude)); -- PostGIS
```

### Dashboard Mappings

**This table powers:**

| Dashboard Page | Metrics | Filters |
|----------------|---------|---------|
| **Geo Intelligence (Store Locations tab)** | Store count by region, density map | region, store_type, urban_rural |
| **Geo Intelligence (Regional Performance tab)** | Revenue per store, store distribution | region, province, city |
| **Dashboard Overview** | Active stores KPI | status |

---

## Table 4: `scout.customers` (Dimension with Profiling)

### Purpose
**Customer profiles with explicit demographics** (gender, age_bracket).

### Grain
**One row per customer**.

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key | `cust-012` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant |
| **customer_code** | varchar(50) | Yes | External ID (if any) | `CUST-00012` | Display |
| | | | | | |
| **-- Demographics (EXPLICIT First-Class) --** | | | | | |
| **gender** | gender_enum | No | male, female, unknown | `female` | Gender filtering |
| **age_bracket** | age_bracket_enum | No | 18_24, 25_34, 35_44, 45_54, 55_plus, unknown | `25_34` | Age filtering |
| **estimated_age** | smallint | Yes | Estimated age (years) | `28` | Age distribution |
| | | | | | |
| **-- Segmentation (EXPLICIT) --** | | | | | |
| **income_segment** | income_segment_enum | No | high, middle, low, unknown | `middle` | Income filtering |
| **urban_rural** | urban_rural_enum | No | urban, rural, unknown | `urban` | Location filtering |
| | | | | | |
| **-- Home Location (if different from store) --** | | | | | |
| **home_barangay** | varchar(100) | Yes | Home barangay | `Barangay Pinyahan` | Home location |
| **home_city** | varchar(100) | Yes | Home city | `Quezon City` | Home city |
| **home_province** | varchar(100) | Yes | Home province | `Metro Manila` | Home province |
| **home_region** | varchar(100) | Yes | Home region | `NCR` | Home region |
| | | | | | |
| **-- Behavioral Flags --** | | | | | |
| **is_repeat_customer** | boolean | No | True if > 1 transaction | `true` | Repeat analysis |
| **first_transaction_date** | date | Yes | Date of first purchase | `2025-11-01` | Cohort analysis |
| **last_transaction_date** | date | Yes | Date of last purchase | `2025-12-06` | Recency |
| **total_transactions** | int | No | Lifetime transaction count | `12` | Frequency |
| **lifetime_value** | numeric(10,2) | No | Lifetime spend (₱) | `1,580.00` | LTV analysis |
| | | | | | |
| **-- Privacy Flags --** | | | | | |
| **is_anonymous** | boolean | No | True if profile is anonymized | `false` | Privacy filtering |
| **consent_recorded** | boolean | No | True if customer consented to tracking | `true` | Compliance |
| | | | | | |
| **created_at** | timestamptz | No | Profile created | `2025-11-01 08:00:00+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 06:35:00+00` | Audit |

### Indexes

```sql
CREATE INDEX idx_customers_tenant ON scout.customers(tenant_id);
CREATE INDEX idx_customers_gender ON scout.customers(gender);
CREATE INDEX idx_customers_age_bracket ON scout.customers(age_bracket);
CREATE INDEX idx_customers_income_segment ON scout.customers(income_segment);
CREATE INDEX idx_customers_urban_rural ON scout.customers(urban_rural);
CREATE INDEX idx_customers_repeat ON scout.customers(is_repeat_customer);
CREATE INDEX idx_customers_home_region ON scout.customers(home_region);
```

### Dashboard Mappings

**This table powers:**

| Dashboard Page | Metrics | Filters |
|----------------|---------|---------|
| **Consumer Profiling (Demographics tab)** | Gender split, income distribution | gender, age_bracket, income_segment |
| **Consumer Profiling (Age & Gender tab)** | Age distribution, gender breakdown | age_bracket, gender |
| **Consumer Profiling (Location tab)** | Urban vs rural, regional distribution | urban_rural, home_region |
| **Consumer Profiling (Segment Behavior tab)** | LTV by segment, repeat rate | income_segment, is_repeat_customer |

---

## Table 5: `scout.products` (Dimension)

### Purpose
**Product/SKU master data**.

### Grain
**One row per product/SKU**.

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key | `prod-345` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant |
| **sku** | varchar(50) | No | SKU code (unique) | `COKE-1L-PET` | SKU filtering |
| **product_name** | varchar(200) | No | Product name | `Coca-Cola 1L PET` | Display |
| **brand_id** | uuid | No | FK to scout.brands | `brand-678` | Brand filtering |
| **brand_name** | varchar(100) | No | Denormalized brand name | `Coca-Cola` | Display |
| **product_category** | product_category_enum | No | beverage, snacks, tobacco, household, personal_care, others | `beverage` | Category filtering |
| **product_subcategory** | varchar(100) | Yes | Subcategory | `Soft Drinks` | Subcategory filtering |
| **pack_size** | varchar(50) | Yes | Package size | `1L` | Pack size filtering |
| **unit_of_measure** | varchar(20) | Yes | Unit (bottle, pack, sachet, etc.) | `bottle` | UOM display |
| **is_tobacco** | boolean | No | True if tobacco product | `false` | Tobacco filtering |
| **is_alcoholic** | boolean | No | True if alcoholic | `false` | Alcohol filtering |
| **status** | status_enum | No | active, discontinued | `active` | Active filtering |
| **created_at** | timestamptz | No | Product created | `2024-01-01 00:00:00+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 00:00:00+00` | Audit |

### Indexes

```sql
CREATE UNIQUE INDEX idx_products_sku ON scout.products(tenant_id, sku);
CREATE INDEX idx_products_brand ON scout.products(brand_id);
CREATE INDEX idx_products_category ON scout.products(product_category);
CREATE INDEX idx_products_subcategory ON scout.products(product_subcategory);
CREATE INDEX idx_products_status ON scout.products(status);
CREATE INDEX idx_products_tobacco ON scout.products(is_tobacco);
```

### Dashboard Mappings

**This table powers:**

| Dashboard Page | Metrics | Filters |
|----------------|---------|---------|
| **Product Mix (Category Mix tab)** | Category distribution | product_category, product_subcategory |
| **Product Mix (Pareto Analysis tab)** | SKU rankings, top products | sku, brand_name |
| **Transaction Trends** | Product filtering | product_category, brand_id |

---

## Table 6: `scout.brands` (Dimension)

### Purpose
**Brand master data**.

### Grain
**One row per brand**.

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key | `brand-678` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant |
| **brand_code** | varchar(50) | No | Brand code | `COKE` | Code display |
| **brand_name** | varchar(100) | No | Brand name | `Coca-Cola` | Display |
| **manufacturer** | varchar(200) | Yes | Manufacturer/company | `The Coca-Cola Company` | Manufacturer filtering |
| **primary_category** | product_category_enum | Yes | Primary category | `beverage` | Category association |
| **is_local_brand** | boolean | No | True if Philippine brand | `false` | Local vs international |
| **status** | status_enum | No | active, discontinued | `active` | Active filtering |
| **created_at** | timestamptz | No | Brand created | `2024-01-01 00:00:00+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 00:00:00+00` | Audit |

### Indexes

```sql
CREATE UNIQUE INDEX idx_brands_code ON scout.brands(tenant_id, brand_code);
CREATE INDEX idx_brands_name ON scout.brands(brand_name);
CREATE INDEX idx_brands_category ON scout.brands(primary_category);
CREATE INDEX idx_brands_local ON scout.brands(is_local_brand);
CREATE INDEX idx_brands_status ON scout.brands(status);
```

### Dashboard Mappings

**This table powers:**

| Dashboard Page | Metrics | Filters |
|----------------|---------|---------|
| **Product Mix** | Brand performance, brand switching | brand_name, manufacturer |
| **Filters (Right Panel)** | Brand multi-select filter | brand_name |

---

## View 1: `scout.v_transaction_trends`

### Purpose
**Pre-aggregated daily transaction metrics** for Transaction Trends page.

### Grain
**One row per date** (or date × region × category for drill-down).

### Definition

```sql
CREATE OR REPLACE VIEW scout.v_transaction_trends AS
SELECT
  tenant_id,
  DATE(timestamp) as transaction_date,
  region,
  product_category,
  
  -- Volume
  COUNT(DISTINCT basket_id) as basket_count,
  COUNT(*) as item_count,
  COUNT(DISTINCT customer_id) as unique_customers,
  
  -- Revenue
  SUM(line_amount) as total_revenue,
  AVG(line_amount) as avg_item_revenue,
  
  -- Basket Metrics (from baskets table join)
  AVG(b.item_count) as avg_items_per_basket,
  AVG(b.total_units) as avg_units_per_basket,
  AVG(b.total_amount) as avg_basket_value,
  
  -- Duration
  AVG(b.duration_seconds) as avg_duration_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY b.duration_seconds) as median_duration_seconds,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END) as impulse_basket_count,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END)::numeric / COUNT(DISTINCT b.id) as impulse_rate,
  
  -- Time Patterns
  SUM(CASE WHEN time_of_day = 'morning' THEN 1 ELSE 0 END) as morning_count,
  SUM(CASE WHEN time_of_day = 'afternoon' THEN 1 ELSE 0 END) as afternoon_count,
  SUM(CASE WHEN time_of_day = 'evening' THEN 1 ELSE 0 END) as evening_count,
  SUM(CASE WHEN time_of_day = 'night' THEN 1 ELSE 0 END) as night_count,
  
  SUM(CASE WHEN is_weekend THEN 1 ELSE 0 END) as weekend_count,
  SUM(CASE WHEN NOT is_weekend THEN 1 ELSE 0 END) as weekday_count,
  
  -- Request Behavior
  SUM(CASE WHEN request_type = 'branded' THEN 1 ELSE 0 END) as branded_request_count,
  SUM(CASE WHEN request_type = 'unbranded' THEN 1 ELSE 0 END) as unbranded_request_count,
  SUM(CASE WHEN request_type = 'unsure' THEN 1 ELSE 0 END) as unsure_request_count,
  
  SUM(CASE WHEN request_mode = 'verbal' THEN 1 ELSE 0 END) as verbal_request_count,
  SUM(CASE WHEN request_mode = 'pointing' THEN 1 ELSE 0 END) as pointing_request_count,
  SUM(CASE WHEN request_mode = 'indirect' THEN 1 ELSE 0 END) as indirect_request_count,
  
  -- Suggestions
  SUM(CASE WHEN store_suggestion_made THEN 1 ELSE 0 END) as suggestion_made_count,
  SUM(CASE WHEN store_suggestion_accepted THEN 1 ELSE 0 END) as suggestion_accepted_count,
  SUM(CASE WHEN store_suggestion_accepted THEN 1 ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN store_suggestion_made THEN 1 ELSE 0 END), 0) as suggestion_acceptance_rate,
  
  -- Substitutions
  SUM(CASE WHEN is_substituted THEN 1 ELSE 0 END) as substitution_count,
  SUM(CASE WHEN is_substituted THEN 1 ELSE 0 END)::numeric / COUNT(*) as substitution_rate

FROM scout.transactions t
LEFT JOIN scout.baskets b ON t.basket_id = b.id
GROUP BY tenant_id, transaction_date, region, product_category;
```

### Indexes

```sql
CREATE INDEX idx_v_transaction_trends_date ON scout.v_transaction_trends(transaction_date DESC);
CREATE INDEX idx_v_transaction_trends_region ON scout.v_transaction_trends(region);
CREATE INDEX idx_v_transaction_trends_category ON scout.v_transaction_trends(product_category);
```

### Dashboard Mappings

**Powers all 4 tabs of Transaction Trends page:**

| Tab | Metrics Used |
|-----|--------------|
| **Volume** | basket_count, item_count, morning/afternoon/evening/night counts, weekend/weekday counts |
| **Revenue** | total_revenue, avg_basket_value, avg_item_revenue |
| **Basket Size** | avg_items_per_basket, avg_units_per_basket |
| **Duration** | avg_duration_seconds, median_duration_seconds, impulse_rate |

---

## View 2: `scout.v_product_mix`

### Purpose
**Category and SKU performance metrics** for Product Mix page.

### Grain
**One row per product** (or category/brand for aggregates).

### Definition

```sql
CREATE OR REPLACE VIEW scout.v_product_mix AS
SELECT
  tenant_id,
  product_id,
  sku,
  product_name,
  brand_id,
  brand_name,
  product_category,
  product_subcategory,
  
  -- Revenue
  SUM(line_amount) as total_revenue,
  COUNT(*) as transaction_count,
  SUM(quantity) as total_units_sold,
  AVG(unit_price) as avg_unit_price,
  
  -- Share Metrics
  SUM(line_amount) / SUM(SUM(line_amount)) OVER (PARTITION BY tenant_id, product_category) as category_share,
  SUM(line_amount) / SUM(SUM(line_amount)) OVER (PARTITION BY tenant_id) as overall_share,
  
  -- Pareto Ranking
  ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY SUM(line_amount) DESC) as revenue_rank,
  SUM(SUM(line_amount)) OVER (PARTITION BY tenant_id ORDER BY SUM(line_amount) DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) /
    SUM(SUM(line_amount)) OVER (PARTITION BY tenant_id) as cumulative_revenue_pct,
  
  -- Basket Analysis
  COUNT(DISTINCT basket_id) as basket_appearance_count,
  COUNT(DISTINCT basket_id)::numeric / (SELECT COUNT(DISTINCT basket_id) FROM scout.transactions WHERE tenant_id = t.tenant_id) as basket_penetration,
  
  -- Geography
  COUNT(DISTINCT region) as regions_sold_in,
  COUNT(DISTINCT store_id) as stores_sold_in,
  
  -- Substitution
  SUM(CASE WHEN is_substituted THEN 1 ELSE 0 END) as times_substituted,
  SUM(CASE WHEN original_product_id = product_id THEN 1 ELSE 0 END) as times_requested_but_substituted

FROM scout.transactions t
GROUP BY tenant_id, product_id, sku, product_name, brand_id, brand_name, product_category, product_subcategory;
```

### Dashboard Mappings

**Powers all 4 tabs of Product Mix page:**

| Tab | Metrics Used |
|-----|--------------|
| **Category Mix** | category_share, overall_share (pie chart) |
| **Pareto Analysis** | revenue_rank, cumulative_revenue_pct (80/20 line) |
| **Substitutions** | (see separate view below) |
| **Basket Analysis** | basket_penetration, basket_appearance_count |

---

## View 3: `scout.v_substitution_flows`

### Purpose
**Product substitution patterns** (A → B flows) for Substitutions tab.

### Grain
**One row per substitution pair** (original product → substitute product).

### Definition

```sql
CREATE OR REPLACE VIEW scout.v_substitution_flows AS
SELECT
  tenant_id,
  
  -- Original (Requested)
  original_product_id,
  op.sku as original_sku,
  op.product_name as original_product_name,
  original_brand_id,
  ob.brand_name as original_brand_name,
  
  -- Substitute (Purchased)
  product_id as substitute_product_id,
  p.sku as substitute_sku,
  p.product_name as substitute_product_name,
  brand_id as substitute_brand_id,
  b.brand_name as substitute_brand_name,
  
  -- Substitution Metrics
  COUNT(*) as substitution_count,
  substitution_reason,
  
  -- Revenue Impact
  SUM(line_amount) as substitute_revenue,
  AVG(unit_price) as avg_substitute_price,
  AVG(op.unit_price) as avg_original_price,
  AVG(unit_price) - AVG(op.unit_price) as avg_price_difference,
  
  -- Geography
  region,
  COUNT(DISTINCT store_id) as stores_with_substitution

FROM scout.transactions t
JOIN scout.products p ON t.product_id = p.id
JOIN scout.brands b ON t.brand_id = b.id
LEFT JOIN scout.products op ON t.original_product_id = op.id
LEFT JOIN scout.brands ob ON t.original_brand_id = ob.id
WHERE t.is_substituted = true
GROUP BY 
  tenant_id,
  original_product_id, op.sku, op.product_name,
  original_brand_id, ob.brand_name,
  product_id, p.sku, p.product_name,
  brand_id, b.brand_name,
  substitution_reason,
  region;
```

### Dashboard Mappings

**Powers Substitutions tab:**

| Visualization | Metrics Used |
|---------------|--------------|
| **Substitution Matrix** (Heatmap) | substitution_count by original × substitute |
| **Substitution Flow** (Sankey) | substitution_count as flow width |
| **Brand Switching** (Chord) | Aggregated by brand pairs |

---

## View 4: `scout.v_consumer_behavior`

### Purpose
**Request types, modes, suggestion acceptance** for Consumer Behavior page.

### Grain
**Aggregated metrics** (can be by date, region, category, etc.).

### Definition

```sql
CREATE OR REPLACE VIEW scout.v_consumer_behavior AS
SELECT
  tenant_id,
  DATE(timestamp) as behavior_date,
  region,
  product_category,
  
  -- Request Type Breakdown
  SUM(CASE WHEN request_type = 'branded' THEN 1 ELSE 0 END) as branded_request_count,
  SUM(CASE WHEN request_type = 'unbranded' THEN 1 ELSE 0 END) as unbranded_request_count,
  SUM(CASE WHEN request_type = 'unsure' THEN 1 ELSE 0 END) as unsure_request_count,
  
  SUM(CASE WHEN request_type = 'branded' THEN 1 ELSE 0 END)::numeric / COUNT(*) as branded_request_pct,
  SUM(CASE WHEN request_type = 'unbranded' THEN 1 ELSE 0 END)::numeric / COUNT(*) as unbranded_request_pct,
  SUM(CASE WHEN request_type = 'unsure' THEN 1 ELSE 0 END)::numeric / COUNT(*) as unsure_request_pct,
  
  -- Request Mode Breakdown
  SUM(CASE WHEN request_mode = 'verbal' THEN 1 ELSE 0 END) as verbal_request_count,
  SUM(CASE WHEN request_mode = 'pointing' THEN 1 ELSE 0 END) as pointing_request_count,
  SUM(CASE WHEN request_mode = 'indirect' THEN 1 ELSE 0 END) as indirect_request_count,
  
  SUM(CASE WHEN request_mode = 'verbal' THEN 1 ELSE 0 END)::numeric / COUNT(*) as verbal_request_pct,
  SUM(CASE WHEN request_mode = 'pointing' THEN 1 ELSE 0 END)::numeric / COUNT(*) as pointing_request_pct,
  SUM(CASE WHEN request_mode = 'indirect' THEN 1 ELSE 0 END)::numeric / COUNT(*) as indirect_request_pct,
  
  -- Store Suggestions
  SUM(CASE WHEN store_suggestion_made THEN 1 ELSE 0 END) as suggestion_made_count,
  SUM(CASE WHEN store_suggestion_accepted THEN 1 ELSE 0 END) as suggestion_accepted_count,
  SUM(CASE WHEN store_suggestion_made AND NOT store_suggestion_accepted THEN 1 ELSE 0 END) as suggestion_rejected_count,
  
  SUM(CASE WHEN store_suggestion_accepted THEN 1 ELSE 0 END)::numeric / 
    NULLIF(SUM(CASE WHEN store_suggestion_made THEN 1 ELSE 0 END), 0) as suggestion_acceptance_rate,
  
  -- Purchase Funnel (simplified - requires external visit tracking)
  COUNT(DISTINCT customer_id) as unique_customers,
  COUNT(DISTINCT basket_id) as baskets,
  COUNT(*) as items_purchased,
  
  -- Impulse Behavior
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END) as impulse_basket_count,
  SUM(CASE WHEN NOT b.is_impulse THEN 1 ELSE 0 END) as planned_basket_count,
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END)::numeric / COUNT(DISTINCT b.id) as impulse_rate

FROM scout.transactions t
LEFT JOIN scout.baskets b ON t.basket_id = b.id
GROUP BY tenant_id, behavior_date, region, product_category;
```

### Dashboard Mappings

**Powers all 4 tabs of Consumer Behavior page:**

| Tab | Metrics Used |
|-----|--------------|
| **Purchase Funnel** | (Requires external visit tracking - not in transactions table) |
| **Request Methods** | branded/unbranded/unsure_request_pct, verbal/pointing/indirect_request_pct |
| **Acceptance Rates** | suggestion_acceptance_rate, suggestion_made/accepted/rejected counts |
| **Behavior Traits** | impulse_rate, impulse vs planned basket counts |

---

## View 5: `scout.v_consumer_profiling`

### Purpose
**Demographic breakdowns** (gender, age, income, location) for Consumer Profiling page.

### Grain
**Aggregated by demographic segment**.

### Definition

```sql
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
  SUM(CASE WHEN b.is_impulse THEN 1 ELSE 0 END)::numeric / COUNT(DISTINCT b.id) as impulse_rate,
  
  -- Frequency
  AVG(c.total_transactions) as avg_lifetime_transactions,
  AVG(c.lifetime_value) as avg_lifetime_value,
  SUM(CASE WHEN c.is_repeat_customer THEN 1 ELSE 0 END)::numeric / COUNT(DISTINCT c.id) as repeat_customer_rate

FROM scout.transactions t
JOIN scout.customers c ON t.customer_id = c.id
LEFT JOIN scout.baskets b ON t.basket_id = b.id
WHERE t.customer_id IS NOT NULL  -- Exclude anonymous transactions
GROUP BY 
  t.tenant_id, 
  profile_date, 
  t.region, 
  t.product_category,
  c.gender, 
  c.age_bracket, 
  c.income_segment, 
  c.urban_rural;
```

### Dashboard Mappings

**Powers all 4 tabs of Consumer Profiling page:**

| Tab | Metrics Used |
|-----|--------------|
| **Demographics** | unique_customers by gender/age/income/urban_rural (sunburst chart) |
| **Age & Gender** | basket_count, revenue by age_bracket and gender (heatmap, pyramid) |
| **Location** | unique_customers by region, urban_rural (map, comparison bars) |
| **Segment Behavior** | avg_basket_value, avg_lifetime_value by segment (bubble chart) |

---

## View 6: `scout.v_geo_intelligence`

### Purpose
**Regional performance, store distribution, market penetration** for Geo Intelligence page.

### Grain
**Aggregated by region** (or province, city).

### Definition

```sql
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
  SUM(t.line_amount) / COUNT(DISTINCT t.store_id) as revenue_per_store,
  
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
  SUM(CASE WHEN t.product_category = 'others' THEN t.line_amount ELSE 0 END) as others_revenue,
  
  -- Growth (requires historical data - placeholder)
  0 as growth_rate_pct,  -- TODO: Compute from historical comparison
  
  -- Market Penetration (requires population data - placeholder)
  0::numeric as penetration_pct,  -- TODO: unique_customers / regional_population * 100
  0 as population  -- TODO: Join to Philippine population data table

FROM scout.transactions t
JOIN scout.stores s ON t.store_id = s.id
GROUP BY 
  t.tenant_id,
  t.island_group,
  t.region,
  t.province,
  t.city;
```

### Dashboard Mappings

**Powers all 4 tabs of Geo Intelligence page:**

| Tab | Metrics Used |
|-----|--------------|
| **Regional Performance** | total_revenue, revenue_per_store, growth_rate_pct by region (map, matrix) |
| **Store Locations** | active_stores, urban/rural stores by region (point map, bar chart) |
| **Demographics** | urban/rural split, age/gender by region (heatmap) |
| **Market Penetration** | penetration_pct, population coverage by region (choropleth, scatter) |

---

## View 7: `scout.v_dashboard_overview`

### Purpose
**Executive summary KPIs** for Dashboard Overview page.

### Grain
**Single row** (aggregated across all data for selected filters).

### Definition

```sql
CREATE OR REPLACE VIEW scout.v_dashboard_overview AS
SELECT
  tenant_id,
  
  -- Volume
  COUNT(DISTINCT basket_id) as total_baskets,
  COUNT(*) as total_items,
  COUNT(DISTINCT customer_id) as unique_customers,
  COUNT(DISTINCT store_id) as active_stores,
  
  -- Revenue
  SUM(line_amount) as total_revenue,
  AVG(b.total_amount) as avg_basket_value,
  
  -- Basket Metrics
  AVG(b.item_count) as avg_items_per_basket,
  AVG(b.total_units) as avg_units_per_basket,
  
  -- Time
  AVG(b.duration_seconds) as avg_duration_seconds,
  
  -- Growth (vs prior period - requires date filtering in query)
  0::numeric as revenue_growth_pct,  -- TODO: Compute in API layer
  0::numeric as basket_growth_pct,   -- TODO: Compute in API layer
  
  -- Top Performers
  (SELECT product_name FROM scout.v_product_mix WHERE tenant_id = t.tenant_id ORDER BY total_revenue DESC LIMIT 1) as top_product,
  (SELECT region FROM scout.v_geo_intelligence WHERE tenant_id = t.tenant_id ORDER BY total_revenue DESC LIMIT 1) as top_region

FROM scout.transactions t
LEFT JOIN scout.baskets b ON t.basket_id = b.id
GROUP BY tenant_id;
```

### Dashboard Mappings

**Powers Dashboard Overview page:**

| Component | Metrics Used |
|-----------|--------------|
| **KPI Cards** | total_baskets, total_revenue, active_stores, avg_items_per_basket |
| **Growth Badges** | revenue_growth_pct, basket_growth_pct (computed in API) |
| **Top Performers** | top_product, top_region |

---

## Table 7: `scout.recommendations` (SariCoach AI)

### Purpose
**AI-generated recommendations** from SariCoach system.

### Grain
**One row per recommendation** (one-to-many with transactions).

### Columns

| Column | Type | Nullable | Description | Sample Value | Dashboard Use |
|--------|------|----------|-------------|--------------|---------------|
| **id** | uuid | No | Primary key | `rec-001` | Join key |
| **tenant_id** | uuid | No | FK to core.tenants | `tenant-001` | Multi-tenant |
| **transaction_id** | uuid | Yes | FK to scout.transactions (if accepted) | `txn-456` | Link to purchase |
| **store_id** | uuid | No | FK to scout.stores | `store-789` | Store context |
| **customer_id** | uuid | Yes | FK to scout.customers | `cust-012` | Customer context |
| | | | | | |
| **-- Recommendation Details --** | | | | | |
| **recommendation_type** | recommendation_type_enum | No | upsell, cross_sell, substitution, stock_advice | `upsell` | Type analysis |
| **recommended_product_id** | uuid | No | FK to scout.products | `prod-999` | Product recommended |
| **reason** | text | No | Why this was recommended | `Customer bought Coke, suggest Chips` | Explainability |
| **confidence_score** | numeric(3,2) | No | AI confidence (0-1) | `0.85` | Quality filtering |
| | | | | | |
| **-- Context --** | | | | | |
| **context_basket_id** | uuid | Yes | Current basket (if mid-transaction) | `basket-456` | Basket context |
| **context_category** | product_category_enum | Yes | Category context | `beverage` | Category-specific recs |
| **context_time_of_day** | time_of_day_enum | No | When recommended | `afternoon` | Time-based patterns |
| | | | | | |
| **-- Outcome --** | | | | | |
| **accepted** | boolean | Yes | True if customer accepted | `false` | Acceptance tracking |
| **accepted_at** | timestamptz | Yes | When accepted | NULL | Acceptance timing |
| **rejection_reason** | text | Yes | Why rejected (if captured) | `Price too high` | Rejection analysis |
| | | | | | |
| **created_at** | timestamptz | No | Recommendation created | `2025-12-07 06:32:20+00` | Audit |
| **updated_at** | timestamptz | No | Last update | `2025-12-07 06:32:20+00` | Audit |

### Indexes

```sql
CREATE INDEX idx_recommendations_tenant ON scout.recommendations(tenant_id);
CREATE INDEX idx_recommendations_transaction ON scout.recommendations(transaction_id);
CREATE INDEX idx_recommendations_store ON scout.recommendations(store_id);
CREATE INDEX idx_recommendations_customer ON scout.recommendations(customer_id);
CREATE INDEX idx_recommendations_type ON scout.recommendations(recommendation_type);
CREATE INDEX idx_recommendations_accepted ON scout.recommendations(accepted);
CREATE INDEX idx_recommendations_created ON scout.recommendations(created_at DESC);
```

### Dashboard Mappings

**Powers AI Recommendation Panel ("Ask Suqi"):**

| Visualization | Metrics Used |
|---------------|--------------|
| **Recommendation Performance** | acceptance rate by type, confidence score distribution |
| **Top Recommendations** | Most accepted recommendations, highest revenue impact |
| **Rejection Analysis** | Common rejection reasons, category-specific patterns |

---

## Enums

### 1. `time_of_day_enum`

```sql
CREATE TYPE time_of_day_enum AS ENUM (
  'morning',      -- 6am - 12pm
  'afternoon',    -- 12pm - 6pm
  'evening',      -- 6pm - 10pm
  'night'         -- 10pm - 6am
);
```

### 2. `product_category_enum`

```sql
CREATE TYPE product_category_enum AS ENUM (
  'beverage',
  'snacks',
  'tobacco',
  'household',
  'personal_care',
  'others'
);
```

### 3. `island_group_enum`

```sql
CREATE TYPE island_group_enum AS ENUM (
  'Luzon',
  'Visayas',
  'Mindanao'
);
```

### 4. `store_type_enum`

```sql
CREATE TYPE store_type_enum AS ENUM (
  'sari_sari',
  'mini_mart',
  'supermarket',
  'wholesaler'
);
```

### 5. `urban_rural_enum`

```sql
CREATE TYPE urban_rural_enum AS ENUM (
  'urban',
  'rural',
  'unknown'
);
```

### 6. `gender_enum`

```sql
CREATE TYPE gender_enum AS ENUM (
  'male',
  'female',
  'unknown',
  'other'
);
```

### 7. `age_bracket_enum`

```sql
CREATE TYPE age_bracket_enum AS ENUM (
  '18_24',
  '25_34',
  '35_44',
  '45_54',
  '55_plus',
  'unknown'
);
```

### 8. `income_segment_enum`

```sql
CREATE TYPE income_segment_enum AS ENUM (
  'high',
  'middle',
  'low',
  'unknown'
);
```

### 9. `request_type_enum` (EXPLICIT)

```sql
CREATE TYPE request_type_enum AS ENUM (
  'branded',      -- "Silka Papaya"
  'unbranded',    -- "may suka kayo?"
  'unsure'        -- Customer hesitates
);
```

### 10. `request_mode_enum` (EXPLICIT)

```sql
CREATE TYPE request_mode_enum AS ENUM (
  'verbal',       -- Spoken request
  'pointing',     -- Non-verbal (pointing/gesturing)
  'indirect'      -- Indirect (asking storeowner)
);
```

### 11. `substitution_reason_enum` (EXPLICIT)

```sql
CREATE TYPE substitution_reason_enum AS ENUM (
  'out_of_stock',
  'price',
  'preference',
  'storeowner_suggestion',
  'other'
);
```

### 12. `recommendation_type_enum`

```sql
CREATE TYPE recommendation_type_enum AS ENUM (
  'upsell',       -- Higher-value variant
  'cross_sell',   -- Complementary product
  'substitution', -- Alternative when out of stock
  'stock_advice'  -- Storeowner inventory suggestion
);
```

### 13. `status_enum`

```sql
CREATE TYPE status_enum AS ENUM (
  'active',
  'inactive',
  'discontinued',
  'temporarily_closed'
);
```

### 14. `population_density_enum`

```sql
CREATE TYPE population_density_enum AS ENUM (
  'low',
  'medium',
  'high'
);
```

---

## AI/RAG Tables (Shared Pattern)

### Table 8: `scout.knowledge_documents`

**Purpose:** Knowledge base documents for RAG.

```sql
CREATE TABLE scout.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id),
  title varchar(500) NOT NULL,
  category varchar(100),  -- 'product_guide', 'market_report', 'best_practices'
  content_type varchar(50),  -- 'pdf', 'text', 'markdown'
  content text NOT NULL,
  metadata jsonb,
  visibility_roles text[],  -- Which roles can access
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_documents_tenant ON scout.knowledge_documents(tenant_id);
CREATE INDEX idx_knowledge_documents_category ON scout.knowledge_documents(category);
```

### Table 9: `scout.knowledge_chunks` (pgvector)

**Purpose:** Vector embeddings for semantic search.

```sql
CREATE TABLE scout.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id),
  document_id uuid NOT NULL REFERENCES scout.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  chunk_text text NOT NULL,
  embedding vector(1536),  -- OpenAI ada-002 embeddings
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_chunks_tenant ON scout.knowledge_chunks(tenant_id);
CREATE INDEX idx_knowledge_chunks_document ON scout.knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_chunks_embedding ON scout.knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Table 10: `scout.ai_conversations`

**Purpose:** AI chat sessions for "Ask Suqi".

```sql
CREATE TABLE scout.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id),
  user_id uuid NOT NULL REFERENCES core.users(id),
  title varchar(500),  -- Auto-generated from first query
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_tenant ON scout.ai_conversations(tenant_id);
CREATE INDEX idx_ai_conversations_user ON scout.ai_conversations(user_id);
```

### Table 11: `scout.ai_messages`

**Purpose:** AI chat message history.

```sql
CREATE TABLE scout.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES scout.ai_conversations(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL,  -- 'user', 'assistant', 'tool'
  content text NOT NULL,
  sources jsonb,  -- Array of source citations
  tool_calls jsonb,  -- Array of tool executions
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_conversation ON scout.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON scout.ai_messages(created_at DESC);
```

---

## Summary: Complete Coverage Checklist

### ✅ A. Transaction Trends (Dynamics)

| Field | Table | Column | Dashboard Use |
|-------|-------|--------|---------------|
| **Duration** | transactions | `transaction_duration_seconds` | Duration tab |
| **Item count** | baskets | `item_count` | Basket Size tab |
| **Units per txn** | baskets | `total_units` | Basket Size tab |
| **Total amount** | baskets | `total_amount` | Revenue tab |
| **Time of day** | transactions | `time_of_day` | Volume by time chart |
| **Is weekend** | transactions | `is_weekend` | Day-of-week patterns |

### ✅ B. Product Mix & SKU (Basket & Substitution)

| Field | Table | Column | Dashboard Use |
|-------|-------|--------|---------------|
| **Item grain** | transactions | (item-level rows) | Basket analysis |
| **Substitution flag** | transactions | `is_substituted` | Substitution flows |
| **Original product** | transactions | `original_product_id` | Substitution matrix |
| **Substitution reason** | transactions | `substitution_reason` | Reason analysis |
| **Top SKUs** | v_product_mix | `revenue_rank` | Pareto chart |
| **Basket composition** | v_product_mix | `basket_penetration` | Association rules |

### ✅ C. Consumer Behaviour & Preference Signals

| Field | Table | Column | Dashboard Use |
|-------|-------|--------|---------------|
| **Request type** | transactions | `request_type` | Branded/unbranded split |
| **Request mode** | transactions | `request_mode` | Verbal/pointing/indirect |
| **Suggestion made** | transactions | `store_suggestion_made` | Suggestion tracking |
| **Suggestion accepted** | transactions | `store_suggestion_accepted` | Acceptance rate |
| **Suggested SKU** | transactions | `store_suggested_sku_id` | Suggestion performance |

### ✅ D. Consumer Profiling (Who is Buying, Where)

| Field | Table | Column | Dashboard Use |
|-------|-------|--------|---------------|
| **Gender** | customers | `gender` | Gender split chart |
| **Age bracket** | customers | `age_bracket` | Age distribution |
| **Income segment** | customers | `income_segment` | Income breakdown |
| **Urban/rural** | customers | `urban_rural` | Location segmentation |
| **Home location** | customers | `home_region` | Geo profiling |

### ✅ E. AI Recommendation Panel & SariCoach Hooks

| Field | Table | Column | Dashboard Use |
|-------|-------|--------|---------------|
| **Recommendation** | recommendations | (all columns) | AI panel metrics |
| **Type** | recommendations | `recommendation_type` | Type breakdown |
| **Accepted** | recommendations | `accepted` | Acceptance tracking |
| **Reason** | recommendations | `reason` | Explainability |

### ✅ F. Reference / Recording Metadata

| Field | Table | Column | Dashboard Use |
|-------|-------|--------|---------------|
| **Recording ID** | transactions | `recording_id` | Audit trail |
| **Confidence score** | transactions | `confidence_score` | Quality filtering |
| **All context** | transactions | (all columns) | Full coverage ✅ |

---

## Data Model Diagram (ERD)

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│  scout.stores  │       │ scout.products │       │  scout.brands  │
│                │       │                │       │                │
│ • id (PK)      │       │ • id (PK)      │       │ • id (PK)      │
│ • store_code   │       │ • sku          │       │ • brand_code   │
│ • store_name   │       │ • product_name │       │ • brand_name   │
│ • region       │       │ • brand_id (FK)│───────┤ • manufacturer │
│ • urban_rural  │       │ • category     │       └────────────────┘
└────────┬───────┘       └────────┬───────┘
         │                        │
         │                        │
         │                        │
         │       ┌────────────────┴────────────────┐
         │       │                                  │
         │       │                                  │
┌────────▼───────▼─────────────────────────────────▼────────────────┐
│                    scout.transactions                              │
│                                                                    │
│ • id (PK)                                                          │
│ • basket_id                                                        │
│ • store_id (FK) ───► scout.stores                                 │
│ • customer_id (FK) ──► scout.customers                            │
│ • product_id (FK) ───► scout.products                             │
│ • brand_id (FK) ─────► scout.brands                               │
│                                                                    │
│ EXPLICIT FIELDS:                                                   │
│ • transaction_duration_seconds                                     │
│ • time_of_day, is_weekend                                         │
│ • request_type, request_mode                                      │
│ • store_suggestion_made, store_suggestion_accepted                │
│ • is_substituted, original_product_id, substitution_reason        │
│ • quantity, unit_price, line_amount                               │
│ • region, province, city, barangay, island_group                  │
└────────┬───────────────────────────────────────────────────────────┘
         │
         │
         │
┌────────▼───────────────────┐        ┌──────────────────────────┐
│    scout.baskets           │        │   scout.customers        │
│                            │        │                          │
│ • id (PK) = basket_id      │        │ • id (PK)                │
│ • item_count               │        │ • gender                 │
│ • total_units              │        │ • age_bracket            │
│ • total_amount             │        │ • income_segment         │
│ • duration_seconds         │        │ • urban_rural            │
│ • is_impulse               │        │ • home_region            │
│ • has_substitution         │        │ • is_repeat_customer     │
│ • has_store_suggestion     │        │ • lifetime_value         │
└────────────────────────────┘        └──────────────────────────┘


┌────────────────────────────────────────────────────────────────┐
│                  ANALYTICS VIEWS (7)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  scout.v_transaction_trends                                    │
│    ► Powers: Transaction Trends page (4 tabs)                 │
│                                                                │
│  scout.v_product_mix                                           │
│    ► Powers: Product Mix page (Category Mix, Pareto, Basket)  │
│                                                                │
│  scout.v_substitution_flows                                    │
│    ► Powers: Product Mix (Substitutions tab)                  │
│                                                                │
│  scout.v_consumer_behavior                                     │
│    ► Powers: Consumer Behavior page (4 tabs)                  │
│                                                                │
│  scout.v_consumer_profiling                                    │
│    ► Powers: Consumer Profiling page (4 tabs)                 │
│                                                                │
│  scout.v_geo_intelligence                                      │
│    ► Powers: Geo Intelligence page (4 tabs)                   │
│                                                                │
│  scout.v_dashboard_overview                                    │
│    ► Powers: Dashboard Overview page                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────┐
│                  AI / RAG TABLES (4)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  scout.recommendations (SariCoach AI)                          │
│    • transaction_id (FK)                                       │
│    • recommendation_type (upsell/cross_sell/substitution)     │
│    • recommended_product_id (FK)                              │
│    • accepted (bool)                                           │
│                                                                │
│  scout.knowledge_documents                                     │
│    • title, category, content                                 │
│                                                                │
│  scout.knowledge_chunks (pgvector)                            │
│    • document_id (FK)                                          │
│    • chunk_text                                                │
│    • embedding vector(1536)                                    │
│                                                                │
│  scout.ai_conversations + scout.ai_messages                    │
│    • user_id, role, content, sources, tool_calls             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Next Steps (Phase 3)

✅ **Phase 2 Complete:** Full data model with explicit first-class columns for ALL dashboard requirements

⏭️ **Phase 3:** Migrations - SQL scripts to create schema, tables, views, indexes, RLS policies

---

**Last Updated:** 2025-12-07  
**Estimated Effort for Phase 2:** 6 hours (actual)  
**Next Phase:** Phase 3 - Migrations (est. 6-8 hours)
