/**
 * Analytics View Types - Match Scout Dashboard Pages
 * 
 * These types define the shape of data returned by analytics endpoints
 * and consumed by dashboard pages.
 */

import type { ProductCategory, TimeOfDay, Gender, AgeGroup, IncomeSegment, UrbanRural } from './entities'

// ============================================================================
// KPI CARDS
// ============================================================================

export interface KpiCard {
  title: string
  value: number | string
  change?: number // Percentage change vs previous period
  changeLabel?: string // e.g., "vs last month"
  trend?: 'up' | 'down' | 'neutral'
  format: 'currency' | 'number' | 'percentage' | 'duration'
}

export interface KpiSummary {
  cards: KpiCard[]
}

// ============================================================================
// DASHBOARD OVERVIEW
// ============================================================================

export interface DashboardOverview {
  overview: {
    total_baskets: number
    total_revenue: number
    unique_customers: number
    active_stores: number
    avg_basket_value: number
    avg_items_per_basket: number
    avg_duration_seconds: number
  }
  trends: {
    revenue_growth_pct: number
    basket_growth_pct: number
    customer_growth_pct: number
  }
  top_categories: Array<{
    category: string
    revenue: number
    share_pct: number
  }>
  top_regions: Array<{
    region: string
    revenue: number
    basket_count: number
  }>
  top_products: Array<{
    product_name: string
    brand_name: string
    revenue: number
    units_sold: number
  }>
}

// ============================================================================
// TRANSACTION TRENDS
// ============================================================================

export type TrendTab = 'volume' | 'revenue' | 'basket_size' | 'duration'
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month'

export interface TimeSeriesPoint {
  timestamp: string
  value: number
}

export interface BreakdownItem {
  label: string
  value: number
  percentage: number
}

export interface TransactionTrendsView {
  kpis: {
    daily_volume: number
    daily_revenue: number
    avg_basket_size: number
    avg_duration: number
  }
  time_series: {
    volume: TimeSeriesPoint[]
    revenue: TimeSeriesPoint[]
    basket_size: TimeSeriesPoint[]
    duration: TimeSeriesPoint[]
  }
  breakdowns: {
    by_time_of_day: BreakdownItem[]
    by_day_of_week: BreakdownItem[]
    by_category: BreakdownItem[]
  }
}

// ============================================================================
// PRODUCT MIX & SKU ANALYTICS
// ============================================================================

export type ProductMixTab = 'category_mix' | 'pareto' | 'substitutions' | 'basket'

export interface CategoryDistribution {
  category: ProductCategory
  revenue: number
  unit_count: number
  share_pct: number
  growth_pct: number
}

export interface ParetoAnalysis {
  products: Array<{
    sku: string
    product_name: string
    brand_name: string
    revenue: number
    cumulative_pct: number
    rank: number
  }>
  pareto_point: number // Index where 80% revenue is reached
}

export interface SubstitutionMatrix {
  flows: Array<{
    from_brand: string
    to_brand: string
    count: number
    reason: string
    conversion_rate: number
  }>
}

export interface BasketComposition {
  avg_items: number
  avg_categories: number
  common_combinations: Array<{
    products: string[]
    frequency: number
    lift: number // Association rule lift
  }>
}

export interface ProductMixView {
  kpis: {
    total_skus: number
    active_skus: number
    new_skus: number
    category_diversity: number
  }
  category_distribution: CategoryDistribution[]
  pareto_analysis: ParetoAnalysis
  substitution_matrix: SubstitutionMatrix
  basket_composition: BasketComposition
}

// ============================================================================
// CONSUMER BEHAVIOR ANALYTICS
// ============================================================================

export type BehaviorTab = 'funnel' | 'request_methods' | 'acceptance' | 'traits'

export interface BehaviorFunnel {
  stages: Array<{
    stage: string
    count: number
    percentage: number
    drop_off_rate: number
  }>
}

export interface RequestMethodBreakdown {
  methods: Array<{
    method: 'verbal' | 'pointing' | 'indirect'
    count: number
    percentage: number
    avg_basket_value: number
  }>
}

export interface AcceptanceRates {
  overall_rate: number
  by_category: Array<{
    category: ProductCategory
    acceptance_rate: number
    suggestion_count: number
  }>
  by_time_of_day: Array<{
    time: TimeOfDay
    acceptance_rate: number
  }>
}

export interface BehaviorTraits {
  impulse_rate: number
  brand_loyalty_score: number
  avg_decision_time: number
  traits: Array<{
    trait: string
    prevalence: number
    impact_on_basket: number
  }>
}

export interface ConsumerBehaviorView {
  kpis: {
    total_interactions: number
    avg_acceptance_rate: number
    impulse_purchase_rate: number
    brand_loyalty_score: number
  }
  funnel: BehaviorFunnel
  request_methods: RequestMethodBreakdown
  acceptance_rates: AcceptanceRates
  behavior_traits: BehaviorTraits
}

// ============================================================================
// CONSUMER PROFILING ANALYTICS
// ============================================================================

export type ProfilingTab = 'income' | 'age_gender' | 'urban_rural' | 'segments'

export interface DemographicDistribution {
  label: string
  count: number
  percentage: number
  avg_basket_value: number
}

export interface SegmentBehavior {
  segment_name: string
  size: number
  avg_basket_value: number
  visit_frequency: number
  preferred_categories: ProductCategory[]
  lifetime_value: number
}

export interface ConsumerProfilingView {
  kpis: {
    total_customers: number
    avg_age: number
    gender_split: { male: number; female: number }
    urban_customers: number
  }
  income_distribution: DemographicDistribution[]
  age_gender_distribution: Array<{
    age_group: AgeGroup
    gender: Gender
    count: number
    percentage: number
  }>
  urban_rural_split: Array<{
    type: UrbanRural
    count: number
    percentage: number
    avg_basket_value: number
  }>
  segment_behaviors: SegmentBehavior[]
}

// ============================================================================
// GEOGRAPHICAL INTELLIGENCE
// ============================================================================

export type GeoTab = 'regional' | 'stores' | 'demographics' | 'penetration'

export interface RegionalPerformanceData {
  region: string
  revenue: number
  basket_count: number
  store_count: number
  avg_basket_value: number
  growth_pct: number
  market_share: number
}

export interface StoreLocation {
  store_id: string
  store_name: string
  latitude: number
  longitude: number
  region: string
  city: string
  revenue: number
  performance_score: number
}

export interface RegionalDemographics {
  region: string
  urban_pct: number
  avg_income: IncomeSegment
  population_density: 'high' | 'medium' | 'low'
  key_demographics: string[]
}

export interface MarketPenetration {
  region: string
  total_population: number
  served_population: number
  penetration_rate: number
  growth_opportunity: number
}

export interface GeoIntelligenceView {
  kpis: {
    top_region: string
    regional_coverage: number
    avg_performance: number
    market_penetration: number
  }
  regional_performance: RegionalPerformanceData[]
  store_locations: StoreLocation[]
  regional_demographics: RegionalDemographics[]
  market_penetration: MarketPenetration[]
}

// ============================================================================
// DATA DICTIONARY (Transactions Schema)
// ============================================================================

export type FieldTag = 'basic_info' | 'product_data' | 'customer_info' | 'behavior' | 'business_logic'

export interface DataDictionaryField {
  field_name: string
  type: string
  required: boolean
  description: string
  example: string
  tags: FieldTag[]
}

export interface TransactionsSchema {
  table_name: string
  description: string
  record_count: number
  fields: DataDictionaryField[]
}

// ============================================================================
// AI INSIGHTS & RECOMMENDATIONS
// ============================================================================

export interface InsightCard {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'trend' | 'anomaly' | 'opportunity' | 'risk'
  metric_change?: number
  timestamp: string
}

export interface AiRecommendation {
  id: string
  title: string
  description: string
  action_items: string[]
  expected_impact: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  timestamp: string
}

export interface AiAssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tool_calls?: Array<{
    tool: string
    input: Record<string, unknown>
    output: Record<string, unknown>
  }>
}

export interface AiAssistantResponse {
  session_id: string
  message: AiAssistantMessage
  insights?: InsightCard[]
  recommendations?: AiRecommendation[]
}
