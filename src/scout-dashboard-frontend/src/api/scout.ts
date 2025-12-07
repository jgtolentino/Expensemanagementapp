/**
 * Scout API - Typed endpoints for all analytics views
 * 
 * Maps to backend endpoints:
 * - GET  /api/scout/dashboard
 * - POST /api/scout/transaction-trends
 * - POST /api/scout/product-mix
 * - POST /api/scout/consumer-behavior
 * - POST /api/scout/consumer-profiling
 * - POST /api/scout/geo-intelligence
 * - GET  /api/scout/transactions-schema
 * - POST /api/scout/ai/ask
 */

import apiClient, { serializeFilters } from './client'
import type { FilterState } from '@/types/filters'
import type {
  DashboardOverview,
  TransactionTrendsView,
  ProductMixView,
  ConsumerBehaviorView,
  ConsumerProfilingView,
  GeoIntelligenceView,
  TransactionsSchema,
  AiAssistantResponse,
} from '@/types/analytics'

// ============================================================================
// DASHBOARD OVERVIEW
// ============================================================================

export async function getDashboardOverview(
  filters?: Partial<FilterState>
): Promise<DashboardOverview> {
  const params = filters ? serializeFilters(filters) : {}
  
  return apiClient.post<DashboardOverview>('/scout/dashboard', params)
}

// ============================================================================
// TRANSACTION TRENDS
// ============================================================================

export interface TransactionTrendsParams extends Partial<FilterState> {
  tab?: 'volume' | 'revenue' | 'basket_size' | 'duration'
  granularity?: 'hour' | 'day' | 'week' | 'month'
}

export async function getTransactionTrends(
  params: TransactionTrendsParams
): Promise<TransactionTrendsView> {
  const payload = {
    ...serializeFilters(params),
    tab: params.tab || 'revenue',
    granularity: params.granularity || 'day',
  }

  return apiClient.post<TransactionTrendsView>('/scout/transaction-trends', payload)
}

// ============================================================================
// PRODUCT MIX & SKU ANALYTICS
// ============================================================================

export interface ProductMixParams extends Partial<FilterState> {
  tab?: 'category_mix' | 'pareto' | 'substitutions' | 'basket'
}

export async function getProductMixAnalytics(
  params: ProductMixParams
): Promise<ProductMixView> {
  const payload = {
    ...serializeFilters(params),
    tab: params.tab || 'category_mix',
  }

  return apiClient.post<ProductMixView>('/scout/product-mix', payload)
}

// ============================================================================
// CONSUMER BEHAVIOR ANALYTICS
// ============================================================================

export interface ConsumerBehaviorParams extends Partial<FilterState> {
  tab?: 'funnel' | 'request_methods' | 'acceptance' | 'traits'
}

export async function getConsumerBehaviorAnalytics(
  params: ConsumerBehaviorParams
): Promise<ConsumerBehaviorView> {
  const payload = {
    ...serializeFilters(params),
    tab: params.tab || 'funnel',
  }

  return apiClient.post<ConsumerBehaviorView>('/scout/consumer-behavior', payload)
}

// ============================================================================
// CONSUMER PROFILING ANALYTICS
// ============================================================================

export interface ConsumerProfilingParams extends Partial<FilterState> {
  tab?: 'income' | 'age_gender' | 'urban_rural' | 'segments'
}

export async function getConsumerProfilingAnalytics(
  params: ConsumerProfilingParams
): Promise<ConsumerProfilingView> {
  const payload = {
    ...serializeFilters(params),
    tab: params.tab || 'income',
  }

  return apiClient.post<ConsumerProfilingView>('/scout/consumer-profiling', payload)
}

// ============================================================================
// GEOGRAPHICAL INTELLIGENCE
// ============================================================================

export interface GeoIntelligenceParams extends Partial<FilterState> {
  tab?: 'regional' | 'stores' | 'demographics' | 'penetration'
}

export async function getGeoIntelligenceAnalytics(
  params: GeoIntelligenceParams
): Promise<GeoIntelligenceView> {
  const payload = {
    ...serializeFilters(params),
    tab: params.tab || 'regional',
  }

  return apiClient.post<GeoIntelligenceView>('/scout/geo-intelligence', payload)
}

// ============================================================================
// DATA DICTIONARY (Transactions Schema)
// ============================================================================

export async function getTransactionsSchema(): Promise<TransactionsSchema> {
  return apiClient.get<TransactionsSchema>('/scout/transactions-schema')
}

// ============================================================================
// AI ASSISTANT (Ask Suqi / SariCoach)
// ============================================================================

export interface AskScoutAiParams {
  session_id?: string
  message: string
  context: {
    route: string // Current page (e.g., "transaction-trends")
    filters: Partial<FilterState>
    selected_entities?: {
      brands?: string[]
      regions?: string[]
      skus?: string[]
    }
  }
}

export async function askScoutAi(
  params: AskScoutAiParams
): Promise<AiAssistantResponse> {
  return apiClient.post<AiAssistantResponse>('/scout/ai/ask', params)
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export interface ExportParams {
  format: 'csv' | 'xlsx' | 'pdf' | 'png'
  route: string
  filters: Partial<FilterState>
  data_type: 'table' | 'chart' | 'report'
}

export async function exportData(params: ExportParams): Promise<Blob> {
  const response = await fetch('/api/scout/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }

  return response.blob()
}

// ============================================================================
// RETAIL OS / SARICOACH SPECIFIC
// ============================================================================

export interface TantrumTamerStats {
  total_tantrums: number
  avg_duration_seconds: number
  resolved_by_suggestion: number
  top_calming_products: Array<{
    product_name: string
    success_rate: number
  }>
}

export interface ScanAndSwitchStats {
  total_scans: number
  switch_rate: number
  top_conquests: Array<{
    from_brand: string
    to_brand: string
    count: number
  }>
}

export interface PredictiveStockStats {
  stockout_risk_count: number
  overstock_count: number
  forecasted_demand: Array<{
    sku: string
    forecast_7d: number
    confidence: number
  }>
  weather_impact: Array<{
    condition: string
    demand_multiplier: number
  }>
}

export interface BrandCommandCenterStats {
  active_campaigns: number
  total_impressions: number
  conversion_rate: number
  top_performing_brands: Array<{
    brand: string
    revenue: number
    growth_pct: number
  }>
}

export interface RetailOsOverview {
  tantrum_tamer: TantrumTamerStats
  scan_and_switch: ScanAndSwitchStats
  predictive_stock: PredictiveStockStats
  brand_command_center: BrandCommandCenterStats
}

export async function getRetailOsOverview(): Promise<RetailOsOverview> {
  return apiClient.get<RetailOsOverview>('/scout/retail-os/overview')
}
