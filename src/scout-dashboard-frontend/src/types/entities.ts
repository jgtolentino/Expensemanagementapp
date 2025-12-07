/**
 * Core Entity Types - Aligned with Odoo CE/OCA 18
 * 
 * These types map to Odoo models:
 * - Store → res.partner (company) + stock.warehouse
 * - Transaction → pos.order
 * - TransactionLine → pos.order.line
 * - Product → product.product
 * - Brand → product_brand (OCA)
 * - Customer → res.partner (individual)
 */

// ============================================================================
// STORE (Sari-Sari Outlet)
// ============================================================================

export type StoreType = 'sari_sari' | 'convenience' | 'supermarket' | 'grocery' | 'specialty'
export type UrbanRural = 'urban' | 'rural'

export interface Store {
  id: string
  external_id: string // Odoo res.partner id
  name: string
  store_type: StoreType
  
  // Location
  region: string
  province: string
  city: string
  barangay: string
  urban_rural: UrbanRural
  latitude: number
  longitude: number
  
  // Metadata
  tenant_id: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

// ============================================================================
// PRODUCT & BRAND
// ============================================================================

export type ProductCategory = 
  | 'beverage'
  | 'snacks'
  | 'personal_care'
  | 'household'
  | 'food'
  | 'tobacco'
  | 'other'

export interface Brand {
  id: string
  external_id: string // Odoo product_brand id
  name: string
  manufacturer: string
  is_local: boolean
  tenant_id: string
}

export interface Product {
  id: string
  external_id: string // Odoo product.product id
  sku: string
  product_name: string
  category: ProductCategory
  brand_id: string
  brand_name: string
  
  // Pricing
  unit_price: number
  cost_price?: number
  margin_pct?: number
  
  // Metadata
  tenant_id: string
  is_active: boolean
  created_at: string
}

// ============================================================================
// CUSTOMER
// ============================================================================

export type Gender = 'male' | 'female' | 'other' | 'unknown'
export type AgeGroup = 'child' | 'teen' | 'young_adult' | 'adult' | 'senior'
export type IncomeSegment = 'low' | 'middle' | 'high'
export type BrandedPreference = 'branded' | 'unbranded' | 'unsure'
export type RequestMode = 'verbal' | 'pointing' | 'indirect'

export interface Customer {
  id: string
  external_id: string // Odoo res.partner id
  email_hash: string
  
  // Demographics
  gender: Gender
  age_bracket: AgeGroup
  income_segment: IncomeSegment
  urban_rural: UrbanRural
  
  // Behavior
  branded_preference: BrandedPreference
  request_mode: RequestMode
  
  // Association
  store_id: string
  tenant_id: string
  created_at: string
}

// ============================================================================
// TRANSACTION
// ============================================================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy'
export type SubstitutionReason = 'out_of_stock' | 'price' | 'recommendation' | 'preference'

export interface TransactionLine {
  id: string
  transaction_id: string
  product_id: string
  product_name: string
  brand_id: string
  brand_name: string
  product_category: ProductCategory
  sku: string
  
  // Quantities
  quantity: number
  unit_price: number
  line_amount: number
  
  // Behavior
  suggestion_made: boolean
  suggestion_accepted: boolean
  substitution_occurred: boolean
  substitution_reason?: SubstitutionReason
  original_brand_id?: string
  
  created_at: string
}

export interface Transaction {
  id: string
  external_id: string // Odoo pos.order id
  basket_id: string
  store_id: string
  customer_id?: string
  
  // Timing
  timestamp: string
  time_of_day: TimeOfDay
  is_weekend: boolean
  
  // Context
  weather_condition?: WeatherCondition
  location: {
    region: string
    province: string
    city: string
    barangay: string
  }
  
  // Aggregates
  total_amount: number
  item_count: number
  
  // Lines
  lines: TransactionLine[]
  
  // Metadata
  tenant_id: string
  created_at: string
}

// ============================================================================
// BASKET (Aggregated Shopping Trip)
// ============================================================================

export interface Basket {
  id: string
  store_id: string
  customer_id?: string
  
  // Timing
  start_ts: string
  end_ts: string
  duration_seconds: number
  
  // Aggregates
  total_amount: number
  item_count: number
  unique_skus: number
  
  // Behavior
  is_impulse: boolean
  suggestion_acceptance_rate: number
  
  // Metadata
  tenant_id: string
  created_at: string
}

// ============================================================================
// LOCATION HIERARCHY
// ============================================================================

export interface LocationHierarchy {
  barangay: string
  city: string
  province: string
  region: string
  urban_rural: UrbanRural
}

export interface RegionalPerformance {
  region: string
  revenue: number
  basket_count: number
  store_count: number
  avg_basket_value: number
  growth_pct: number
}

// ============================================================================
// WEATHER & EVENTS (For Predictive Stock)
// ============================================================================

export interface WeatherSnapshot {
  id: string
  location: string
  timestamp: string
  condition: WeatherCondition
  temperature_c: number
  humidity_pct: number
}

export interface LocalEvent {
  id: string
  name: string
  event_type: 'festival' | 'holiday' | 'sports' | 'religious' | 'other'
  location: string
  start_date: string
  end_date: string
  expected_impact: 'high' | 'medium' | 'low'
}

// ============================================================================
// AD NETWORK (For Retail OS Command Center)
// ============================================================================

export interface AdSlot {
  id: string
  store_id: string
  slot_type: 'shelf_talker' | 'endcap' | 'counter' | 'digital_screen'
  position: string
  daily_impressions: number
  status: 'available' | 'booked' | 'active'
}

export interface AdCampaign {
  id: string
  brand_id: string
  campaign_name: string
  start_date: string
  end_date: string
  target_regions: string[]
  target_demographics: {
    age_groups: AgeGroup[]
    income_segments: IncomeSegment[]
  }
  budget: number
  spent: number
  impressions: number
  conversions: number
}

// ============================================================================
// SUBSTITUTION FLOWS
// ============================================================================

export interface SubstitutionFlow {
  original_brand_id: string
  original_brand_name: string
  substitute_brand_id: string
  substitute_brand_name: string
  product_category: ProductCategory
  count: number
  reason: SubstitutionReason
  conversion_rate: number
}
