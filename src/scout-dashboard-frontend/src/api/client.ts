/**
 * API Client Configuration
 * 
 * Base HTTP client with:
 * - Authentication (JWT from context)
 * - Tenant isolation
 * - Error handling
 * - Retries
 */

import type { FilterState } from '@/types/filters'

// ============================================================================
// CONFIG
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const DEFAULT_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 2

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

// ============================================================================
// AUTH CONTEXT (will be populated by AuthContext)
// ============================================================================

let authToken: string | null = null
let tenantId: string | null = null
let userRoles: string[] = []

export function setAuthContext(token: string, tenant: string, roles: string[]) {
  authToken = token
  tenantId = tenant
  userRoles = roles
}

export function clearAuthContext() {
  authToken = null
  tenantId = null
  userRoles = []
}

export function getAuthContext() {
  return { authToken, tenantId, userRoles }
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
  } = options

  const url = `${API_BASE_URL}${endpoint}`

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add auth token
  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`
  }

  // Add tenant context
  if (tenantId) {
    requestHeaders['X-Tenant-ID'] = tenantId
  }

  // Add user roles
  if (userRoles.length > 0) {
    requestHeaders['X-User-Roles'] = userRoles.join(',')
  }

  // Setup timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: unknown
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }

      throw new ApiError(response.status, response.statusText, errorData)
    }

    // Parse response
    const data = await response.json()
    return data as T
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timeout')
    }

    // Handle network errors
    if (error instanceof TypeError) {
      // Retry on network errors
      if (retries > 0) {
        await sleep(1000) // Wait 1 second before retry
        return request<T>(endpoint, { ...options, retries: retries - 1 })
      }
      throw new NetworkError('Network connection failed')
    }

    // Re-throw API errors
    throw error
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),
}

// ============================================================================
// FILTER SERIALIZATION
// ============================================================================

/**
 * Convert FilterState to query params / request body
 */
export function serializeFilters(filters: Partial<FilterState>): Record<string, unknown> {
  return {
    // Entity filters
    brands: filters.selected_brands,
    categories: filters.selected_categories,
    regions: filters.selected_regions,
    cities: filters.selected_cities,
    stores: filters.selected_stores,

    // Time filters
    start_date: filters.time_range?.start_date,
    end_date: filters.time_range?.end_date,
    time_of_day: filters.time_of_day_filter,
    weekday_filter: filters.weekday_filter,

    // Demographics
    income_segments: filters.income_segments,
    age_groups: filters.age_groups,
    gender: filters.gender_filter,
    urban_rural: filters.urban_rural_filter,

    // Behavior
    suggestion_filter: filters.suggestion_filter,
    substitution_filter: filters.substitution_filter,
    impulse_filter: filters.impulse_filter,

    // Analysis mode
    analysis_mode: filters.analysis_mode?.mode,
    comparison_target: filters.comparison?.target,

    // Display options
    metric: filters.display_options?.primary_metric,
    aggregation: filters.display_options?.aggregation_level,
    chart_mode: filters.display_options?.chart_mode,
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export { apiClient as default }
