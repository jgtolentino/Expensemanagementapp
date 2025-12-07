/**
 * Global Filter Store (Zustand)
 * 
 * Single source of truth for all filter state across the dashboard.
 * Used by the "Advanced Filters" panel and consumed by all analytics pages.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, FilterActions, TimeRange, TimeRangePreset, AnalysisModeConfig, ComparisonConfig, DisplayOptions } from '@/types/filters'
import type { ProductCategory } from '@/types/entities'

// ============================================================================
// DEFAULT STATE
// ============================================================================

function getDefaultTimeRange(): TimeRange {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30) // Last 30 days

  return {
    preset: 'last_30_days',
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

const defaultDisplayOptions: DisplayOptions = {
  primary_metric: 'revenue',
  chart_mode: 'line',
  aggregation_level: 'daily',
  show_trends: true,
  show_comparisons: false,
  show_forecasts: false,
}

const defaultAnalysisMode: AnalysisModeConfig = {
  mode: 'single',
}

const defaultComparison: ComparisonConfig = {
  target: 'market_average',
}

const defaultState: FilterState = {
  // Entity Selection
  selected_brands: [],
  selected_categories: [],
  selected_regions: [],
  selected_cities: [],
  selected_stores: [],

  // Time & Temporal
  time_range: getDefaultTimeRange(),
  time_of_day_filter: [],
  weekday_filter: [],

  // Demographics
  income_segments: [],
  age_groups: [],
  gender_filter: [],
  urban_rural_filter: [],

  // Behavior
  suggestion_filter: 'all',
  substitution_filter: 'all',
  impulse_filter: 'all',

  // Analysis Configuration
  analysis_mode: defaultAnalysisMode,
  comparison: defaultComparison,
  display_options: defaultDisplayOptions,

  // Metadata
  last_updated: new Date().toISOString(),
}

// ============================================================================
// STORE
// ============================================================================

type FilterStore = FilterState & FilterActions

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ========================================================================
      // ENTITY SELECTION
      // ========================================================================

      setSelectedBrands: (brands) =>
        set({ selected_brands: brands, last_updated: new Date().toISOString() }),

      setSelectedCategories: (categories) =>
        set({ selected_categories: categories, last_updated: new Date().toISOString() }),

      setSelectedRegions: (regions) =>
        set({ selected_regions: regions, last_updated: new Date().toISOString() }),

      setSelectedCities: (cities) =>
        set({ selected_cities: cities, last_updated: new Date().toISOString() }),

      setSelectedStores: (stores) =>
        set({ selected_stores: stores, last_updated: new Date().toISOString() }),

      // ========================================================================
      // TIME RANGE
      // ========================================================================

      setTimeRange: (range) =>
        set({ time_range: range, last_updated: new Date().toISOString() }),

      setTimeRangePreset: (preset) => {
        const range = getTimeRangeFromPreset(preset)
        set({ time_range: range, last_updated: new Date().toISOString() })
      },

      setCustomDateRange: (start, end) => {
        const range: TimeRange = {
          preset: 'custom',
          start_date: start,
          end_date: end,
        }
        set({ time_range: range, last_updated: new Date().toISOString() })
      },

      // ========================================================================
      // ANALYSIS CONFIGURATION
      // ========================================================================

      setAnalysisMode: (mode) =>
        set({ analysis_mode: mode, last_updated: new Date().toISOString() }),

      setComparison: (comparison) =>
        set({ comparison, last_updated: new Date().toISOString() }),

      setDisplayOptions: (options) =>
        set((state) => ({
          display_options: { ...state.display_options, ...options },
          last_updated: new Date().toISOString(),
        })),

      // ========================================================================
      // BEHAVIOR FILTERS
      // ========================================================================

      setSuggestionFilter: (filter) =>
        set({ suggestion_filter: filter, last_updated: new Date().toISOString() }),

      setSubstitutionFilter: (filter) =>
        set({ substitution_filter: filter, last_updated: new Date().toISOString() }),

      setImpulseFilter: (filter) =>
        set({ impulse_filter: filter, last_updated: new Date().toISOString() }),

      // ========================================================================
      // BULK OPERATIONS
      // ========================================================================

      resetFilters: () => set({ ...defaultState, last_updated: new Date().toISOString() }),

      applyPreset: (preset) => {
        const presetFilters = getPresetFilters(preset.name)
        set({ ...presetFilters, last_updated: new Date().toISOString() })
      },
    }),
    {
      name: 'scout-filters', // LocalStorage key
      partialize: (state) => ({
        // Only persist certain fields (not last_updated)
        selected_brands: state.selected_brands,
        selected_categories: state.selected_categories,
        selected_regions: state.selected_regions,
        selected_cities: state.selected_cities,
        selected_stores: state.selected_stores,
        time_range: state.time_range,
        display_options: state.display_options,
        analysis_mode: state.analysis_mode,
        comparison: state.comparison,
      }),
    }
  )
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTimeRangeFromPreset(preset: TimeRangePreset): TimeRange {
  const end = new Date()
  const start = new Date()

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      break
    case 'last_7_days':
      start.setDate(start.getDate() - 7)
      break
    case 'last_30_days':
      start.setDate(start.getDate() - 30)
      break
    case 'last_90_days':
      start.setDate(start.getDate() - 90)
      break
    case 'this_month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'last_month':
      start.setMonth(start.getMonth() - 1)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setDate(0) // Last day of previous month
      end.setHours(23, 59, 59, 999)
      break
    case 'this_quarter':
      const quarter = Math.floor(start.getMonth() / 3)
      start.setMonth(quarter * 3)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'this_year':
      start.setMonth(0)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'custom':
      // Return current range for custom
      return getDefaultTimeRange()
  }

  return {
    preset,
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  }
}

function getPresetFilters(presetName: string): Partial<FilterState> {
  switch (presetName) {
    case 'all_data':
      return defaultState

    case 'top_performers':
      return {
        ...defaultState,
        display_options: {
          ...defaultDisplayOptions,
          primary_metric: 'revenue',
          show_trends: true,
        },
      }

    case 'underperformers':
      return {
        ...defaultState,
        display_options: {
          ...defaultDisplayOptions,
          primary_metric: 'revenue',
          show_trends: true,
        },
      }

    case 'high_value_customers':
      return {
        ...defaultState,
        income_segments: ['high', 'middle'],
        display_options: {
          ...defaultDisplayOptions,
          primary_metric: 'basket_value',
        },
      }

    case 'impulse_buyers':
      return {
        ...defaultState,
        impulse_filter: 'impulse_only',
        display_options: {
          ...defaultDisplayOptions,
          primary_metric: 'volume',
        },
      }

    case 'brand_loyal':
      return {
        ...defaultState,
        suggestion_filter: 'rejected_only', // Rejected suggestions = brand loyal
        display_options: {
          ...defaultDisplayOptions,
          primary_metric: 'volume',
        },
      }

    case 'substitution_risk':
      return {
        ...defaultState,
        substitution_filter: 'substituted_only',
        display_options: {
          ...defaultDisplayOptions,
          show_comparisons: true,
        },
      }

    default:
      return defaultState
  }
}

// ============================================================================
// SELECTORS (Computed Values)
// ============================================================================

export function useActiveFilterCount() {
  return useFilterStore((state) => {
    let count = 0
    if (state.selected_brands.length > 0) count++
    if (state.selected_categories.length > 0) count++
    if (state.selected_regions.length > 0) count++
    if (state.selected_cities.length > 0) count++
    if (state.selected_stores.length > 0) count++
    if (state.time_of_day_filter.length > 0) count++
    if (state.weekday_filter.length > 0) count++
    if (state.suggestion_filter !== 'all') count++
    if (state.substitution_filter !== 'all') count++
    if (state.impulse_filter !== 'all') count++
    return count
  })
}

export function useFilterSummary() {
  return useFilterStore((state) => {
    const count = useActiveFilterCount()
    const hasEntityFilters = (
      state.selected_brands.length > 0 ||
      state.selected_categories.length > 0 ||
      state.selected_regions.length > 0
    )
    const hasTimeFilters = state.time_range.preset !== 'last_30_days'
    const hasBehaviorFilters = (
      state.suggestion_filter !== 'all' ||
      state.substitution_filter !== 'all' ||
      state.impulse_filter !== 'all'
    )

    let summary = 'All data'
    if (count > 0) {
      const parts: string[] = []
      if (state.selected_brands.length > 0) parts.push(`${state.selected_brands.length} brands`)
      if (state.selected_categories.length > 0) parts.push(`${state.selected_categories.length} categories`)
      if (state.selected_regions.length > 0) parts.push(`${state.selected_regions.length} regions`)
      summary = parts.join(', ') || `${count} filters active`
    }

    return {
      active_filter_count: count,
      has_entity_filters: hasEntityFilters,
      has_time_filters: hasTimeFilters,
      has_behavior_filters: hasBehaviorFilters,
      summary_text: summary,
    }
  })
}
