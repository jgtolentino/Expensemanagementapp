/**
 * Filter State Types
 * 
 * Defines the shape of filters used across all analytics pages.
 * Corresponds to the "Advanced Filters" panel in the UI.
 */

import type { ProductCategory, TimeOfDay, UrbanRural } from './entities'

// ============================================================================
// TIME RANGE
// ============================================================================

export type TimeRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom'

export interface TimeRange {
  preset: TimeRangePreset
  start_date: string // ISO 8601
  end_date: string // ISO 8601
}

// ============================================================================
// ANALYSIS MODE
// ============================================================================

export type AnalysisMode = 'single' | 'between_two' | 'among_multiple'

export interface AnalysisModeConfig {
  mode: AnalysisMode
  primary_entity?: string // ID of primary entity (brand, region, etc.)
  comparison_entities?: string[] // IDs of entities to compare
}

// ============================================================================
// COMPARISON TARGET
// ============================================================================

export type ComparisonTarget = 'our_brand' | 'competitors' | 'market_average'

export interface ComparisonConfig {
  target: ComparisonTarget
  our_brand_ids?: string[]
  competitor_brand_ids?: string[]
}

// ============================================================================
// DISPLAY OPTIONS
// ============================================================================

export type MetricType = 'revenue' | 'volume' | 'basket_value' | 'margin' | 'growth'
export type ChartMode = 'line' | 'bar' | 'area' | 'pie' | 'table'
export type AggregationLevel = 'transaction' | 'basket' | 'daily' | 'weekly' | 'monthly'

export interface DisplayOptions {
  primary_metric: MetricType
  chart_mode: ChartMode
  aggregation_level: AggregationLevel
  show_trends: boolean
  show_comparisons: boolean
  show_forecasts: boolean
}

// ============================================================================
// FILTER STATE (Master)
// ============================================================================

export interface FilterState {
  // Entity Selection
  selected_brands: string[]
  selected_categories: ProductCategory[]
  selected_regions: string[]
  selected_cities: string[]
  selected_stores: string[]
  
  // Time & Temporal
  time_range: TimeRange
  time_of_day_filter: TimeOfDay[]
  weekday_filter: ('weekday' | 'weekend')[]
  
  // Demographics
  income_segments: string[]
  age_groups: string[]
  gender_filter: string[]
  urban_rural_filter: UrbanRural[]
  
  // Behavior
  suggestion_filter: 'all' | 'suggested_only' | 'accepted_only' | 'rejected_only'
  substitution_filter: 'all' | 'substituted_only' | 'no_substitution'
  impulse_filter: 'all' | 'impulse_only' | 'planned_only'
  
  // Analysis Configuration
  analysis_mode: AnalysisModeConfig
  comparison: ComparisonConfig
  display_options: DisplayOptions
  
  // Metadata
  last_updated: string
}

// ============================================================================
// FILTER ACTIONS
// ============================================================================

export interface FilterActions {
  // Entity Selection
  setSelectedBrands: (brands: string[]) => void
  setSelectedCategories: (categories: ProductCategory[]) => void
  setSelectedRegions: (regions: string[]) => void
  setSelectedCities: (cities: string[]) => void
  setSelectedStores: (stores: string[]) => void
  
  // Time
  setTimeRange: (range: TimeRange) => void
  setTimeRangePreset: (preset: TimeRangePreset) => void
  setCustomDateRange: (start: string, end: string) => void
  
  // Analysis
  setAnalysisMode: (mode: AnalysisModeConfig) => void
  setComparison: (comparison: ComparisonConfig) => void
  setDisplayOptions: (options: Partial<DisplayOptions>) => void
  
  // Behavior filters
  setSuggestionFilter: (filter: FilterState['suggestion_filter']) => void
  setSubstitutionFilter: (filter: FilterState['substitution_filter']) => void
  setImpulseFilter: (filter: FilterState['impulse_filter']) => void
  
  // Bulk operations
  resetFilters: () => void
  applyPreset: (preset: FilterPreset) => void
}

// ============================================================================
// FILTER PRESETS
// ============================================================================

export type FilterPresetName = 
  | 'all_data'
  | 'top_performers'
  | 'underperformers'
  | 'high_value_customers'
  | 'impulse_buyers'
  | 'brand_loyal'
  | 'substitution_risk'

export interface FilterPreset {
  name: FilterPresetName
  label: string
  description: string
  filters: Partial<FilterState>
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface FilterSummary {
  active_filter_count: number
  has_entity_filters: boolean
  has_time_filters: boolean
  has_behavior_filters: boolean
  summary_text: string
}
