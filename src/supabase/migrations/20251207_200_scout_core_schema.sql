-- =====================================================================
-- Scout Dashboard - Migration 1: Core Schema & Enums
-- =====================================================================
-- Purpose: Create scout schema and all enum types
-- Dependencies: core.tenants, core.users (assumed to exist)
-- Author: TBWA Agency Databank
-- Date: 2025-12-07
-- =====================================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS scout;

-- Grant usage
GRANT USAGE ON SCHEMA scout TO authenticated;
GRANT ALL ON SCHEMA scout TO service_role;

-- =====================================================================
-- ENUMS
-- =====================================================================

-- Time of Day
CREATE TYPE scout.time_of_day_enum AS ENUM (
  'morning',      -- 6am - 12pm
  'afternoon',    -- 12pm - 6pm
  'evening',      -- 6pm - 10pm
  'night'         -- 10pm - 6am
);

-- Product Category
CREATE TYPE scout.product_category_enum AS ENUM (
  'beverage',
  'snacks',
  'tobacco',
  'household',
  'personal_care',
  'others'
);

-- Island Group
CREATE TYPE scout.island_group_enum AS ENUM (
  'Luzon',
  'Visayas',
  'Mindanao'
);

-- Store Type
CREATE TYPE scout.store_type_enum AS ENUM (
  'sari_sari',
  'mini_mart',
  'supermarket',
  'wholesaler'
);

-- Urban/Rural
CREATE TYPE scout.urban_rural_enum AS ENUM (
  'urban',
  'rural',
  'unknown'
);

-- Gender
CREATE TYPE scout.gender_enum AS ENUM (
  'male',
  'female',
  'unknown',
  'other'
);

-- Age Bracket
CREATE TYPE scout.age_bracket_enum AS ENUM (
  '18_24',
  '25_34',
  '35_44',
  '45_54',
  '55_plus',
  'unknown'
);

-- Income Segment
CREATE TYPE scout.income_segment_enum AS ENUM (
  'high',
  'middle',
  'low',
  'unknown'
);

-- Request Type (EXPLICIT)
CREATE TYPE scout.request_type_enum AS ENUM (
  'branded',      -- "Silka Papaya"
  'unbranded',    -- "may suka kayo?"
  'unsure'        -- Customer hesitates
);

-- Request Mode (EXPLICIT)
CREATE TYPE scout.request_mode_enum AS ENUM (
  'verbal',       -- Spoken request
  'pointing',     -- Non-verbal (pointing/gesturing)
  'indirect'      -- Indirect (asking storeowner)
);

-- Substitution Reason (EXPLICIT)
CREATE TYPE scout.substitution_reason_enum AS ENUM (
  'out_of_stock',
  'price',
  'preference',
  'storeowner_suggestion',
  'other'
);

-- Recommendation Type
CREATE TYPE scout.recommendation_type_enum AS ENUM (
  'upsell',       -- Higher-value variant
  'cross_sell',   -- Complementary product
  'substitution', -- Alternative when out of stock
  'stock_advice'  -- Storeowner inventory suggestion
);

-- Status
CREATE TYPE scout.status_enum AS ENUM (
  'active',
  'inactive',
  'discontinued',
  'temporarily_closed'
);

-- Population Density
CREATE TYPE scout.population_density_enum AS ENUM (
  'low',
  'medium',
  'high'
);

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON SCHEMA scout IS 'Scout Dashboard - Retail Analytics Platform';

COMMENT ON TYPE scout.time_of_day_enum IS 'Time of day segments for transaction analysis';
COMMENT ON TYPE scout.product_category_enum IS 'Product categories for Philippine retail';
COMMENT ON TYPE scout.island_group_enum IS 'Philippine island groups';
COMMENT ON TYPE scout.request_type_enum IS 'How customer requested the product (EXPLICIT for behavior analysis)';
COMMENT ON TYPE scout.request_mode_enum IS 'Communication mode of request (EXPLICIT for behavior analysis)';
COMMENT ON TYPE scout.substitution_reason_enum IS 'Why a product was substituted (EXPLICIT for substitution flows)';

-- =====================================================================
-- GRANTS
-- =====================================================================

GRANT USAGE ON TYPE scout.time_of_day_enum TO authenticated;
GRANT USAGE ON TYPE scout.product_category_enum TO authenticated;
GRANT USAGE ON TYPE scout.island_group_enum TO authenticated;
GRANT USAGE ON TYPE scout.store_type_enum TO authenticated;
GRANT USAGE ON TYPE scout.urban_rural_enum TO authenticated;
GRANT USAGE ON TYPE scout.gender_enum TO authenticated;
GRANT USAGE ON TYPE scout.age_bracket_enum TO authenticated;
GRANT USAGE ON TYPE scout.income_segment_enum TO authenticated;
GRANT USAGE ON TYPE scout.request_type_enum TO authenticated;
GRANT USAGE ON TYPE scout.request_mode_enum TO authenticated;
GRANT USAGE ON TYPE scout.substitution_reason_enum TO authenticated;
GRANT USAGE ON TYPE scout.recommendation_type_enum TO authenticated;
GRANT USAGE ON TYPE scout.status_enum TO authenticated;
GRANT USAGE ON TYPE scout.population_density_enum TO authenticated;

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
