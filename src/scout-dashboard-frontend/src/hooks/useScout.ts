/**
 * TanStack Query Hooks for Scout API
 * 
 * Wraps all Scout API calls with:
 * - Caching (5-min stale time)
 * - Loading states
 * - Error handling
 * - Automatic refetching
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
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
import {
  getDashboardOverview,
  getTransactionTrends,
  getProductMixAnalytics,
  getConsumerBehaviorAnalytics,
  getConsumerProfilingAnalytics,
  getGeoIntelligenceAnalytics,
  getTransactionsSchema,
  askScoutAi,
  getRetailOsOverview,
  type TransactionTrendsParams,
  type ProductMixParams,
  type ConsumerBehaviorParams,
  type ConsumerProfilingParams,
  type GeoIntelligenceParams,
  type AskScoutAiParams,
  type RetailOsOverview,
} from '@/api/scout'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const scoutKeys = {
  all: ['scout'] as const,
  dashboard: (filters: Partial<FilterState>) => ['scout', 'dashboard', filters] as const,
  transactionTrends: (params: TransactionTrendsParams) => ['scout', 'transaction-trends', params] as const,
  productMix: (params: ProductMixParams) => ['scout', 'product-mix', params] as const,
  consumerBehavior: (params: ConsumerBehaviorParams) => ['scout', 'consumer-behavior', params] as const,
  consumerProfiling: (params: ConsumerProfilingParams) => ['scout', 'consumer-profiling', params] as const,
  geoIntelligence: (params: GeoIntelligenceParams) => ['scout', 'geo-intelligence', params] as const,
  transactionsSchema: () => ['scout', 'transactions-schema'] as const,
  retailOs: () => ['scout', 'retail-os'] as const,
}

// ============================================================================
// DASHBOARD OVERVIEW
// ============================================================================

export function useDashboardOverview(
  filters?: Partial<FilterState>,
  options?: Omit<UseQueryOptions<DashboardOverview>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.dashboard(filters || {}),
    queryFn: () => getDashboardOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// ============================================================================
// TRANSACTION TRENDS
// ============================================================================

export function useTransactionTrends(
  params: TransactionTrendsParams,
  options?: Omit<UseQueryOptions<TransactionTrendsView>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.transactionTrends(params),
    queryFn: () => getTransactionTrends(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// PRODUCT MIX & SKU ANALYTICS
// ============================================================================

export function useProductMixAnalytics(
  params: ProductMixParams,
  options?: Omit<UseQueryOptions<ProductMixView>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.productMix(params),
    queryFn: () => getProductMixAnalytics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// CONSUMER BEHAVIOR ANALYTICS
// ============================================================================

export function useConsumerBehaviorAnalytics(
  params: ConsumerBehaviorParams,
  options?: Omit<UseQueryOptions<ConsumerBehaviorView>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.consumerBehavior(params),
    queryFn: () => getConsumerBehaviorAnalytics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// CONSUMER PROFILING ANALYTICS
// ============================================================================

export function useConsumerProfilingAnalytics(
  params: ConsumerProfilingParams,
  options?: Omit<UseQueryOptions<ConsumerProfilingView>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.consumerProfiling(params),
    queryFn: () => getConsumerProfilingAnalytics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// GEOGRAPHICAL INTELLIGENCE
// ============================================================================

export function useGeoIntelligenceAnalytics(
  params: GeoIntelligenceParams,
  options?: Omit<UseQueryOptions<GeoIntelligenceView>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.geoIntelligence(params),
    queryFn: () => getGeoIntelligenceAnalytics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// DATA DICTIONARY (Transactions Schema)
// ============================================================================

export function useTransactionsSchema(
  options?: Omit<UseQueryOptions<TransactionsSchema>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.transactionsSchema(),
    queryFn: getTransactionsSchema,
    staleTime: 30 * 60 * 1000, // 30 minutes (schema changes infrequently)
    ...options,
  })
}

// ============================================================================
// AI ASSISTANT (Ask Suqi / SariCoach)
// ============================================================================

export function useAskScoutAi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: AskScoutAiParams) => askScoutAi(params),
    onSuccess: (data) => {
      // Optionally invalidate relevant queries if AI provides new insights
      // For now, just log the response
      console.log('AI response received:', data)
    },
  })
}

// ============================================================================
// RETAIL OS OVERVIEW
// ============================================================================

export function useRetailOsOverview(
  options?: Omit<UseQueryOptions<RetailOsOverview>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scoutKeys.retailOs(),
    queryFn: getRetailOsOverview,
    staleTime: 2 * 60 * 1000, // 2 minutes (more real-time)
    ...options,
  })
}

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

export function usePrefetchDashboard() {
  const queryClient = useQueryClient()

  return (filters?: Partial<FilterState>) => {
    queryClient.prefetchQuery({
      queryKey: scoutKeys.dashboard(filters || {}),
      queryFn: () => getDashboardOverview(filters),
    })
  }
}

export function usePrefetchTransactionTrends() {
  const queryClient = useQueryClient()

  return (params: TransactionTrendsParams) => {
    queryClient.prefetchQuery({
      queryKey: scoutKeys.transactionTrends(params),
      queryFn: () => getTransactionTrends(params),
    })
  }
}

// ============================================================================
// INVALIDATION HELPERS
// ============================================================================

export function useInvalidateScoutQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: scoutKeys.all }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: scoutKeys.dashboard({}) }),
    invalidateTransactionTrends: () => queryClient.invalidateQueries({ queryKey: ['scout', 'transaction-trends'] }),
    invalidateProductMix: () => queryClient.invalidateQueries({ queryKey: ['scout', 'product-mix'] }),
    invalidateConsumerBehavior: () => queryClient.invalidateQueries({ queryKey: ['scout', 'consumer-behavior'] }),
    invalidateConsumerProfiling: () => queryClient.invalidateQueries({ queryKey: ['scout', 'consumer-profiling'] }),
    invalidateGeoIntelligence: () => queryClient.invalidateQueries({ queryKey: ['scout', 'geo-intelligence'] }),
  }
}
