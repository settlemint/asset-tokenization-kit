/**
 * Shared query options constants for TanStack Query
 *
 * These constants provide standardized caching behavior across the application,
 * optimized for different types of data and use cases.
 */

/**
 * Query options optimized for chart and analytics data
 *
 * Charts typically display aggregated data that doesn't change frequently,
 * so we use longer cache times to reduce unnecessary network requests.
 *
 * - staleTime: 5 minutes - keeps data fresh for reasonable time
 * - gcTime: 10 minutes - retains cached data longer than staleTime
 */
export const CHART_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Query options for real-time or frequently changing data
 *
 * Use these for data that needs to be more current, such as:
 * - Live prices, balances, or transaction status
 * - User-specific data that changes often
 *
 * - staleTime: 30 seconds - shorter freshness window
 * - gcTime: 2 minutes - standard garbage collection
 */
export const REALTIME_QUERY_OPTIONS = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 2 * 60 * 1000, // 2 minutes
} as const;

/**
 * Query options for static or rarely changing data
 *
 * Use these for configuration data, metadata, or other content
 * that rarely changes:
 * - System settings, user profiles, token metadata
 *
 * - staleTime: 15 minutes - long freshness window
 * - gcTime: 30 minutes - extended cache retention
 */
export const STATIC_QUERY_OPTIONS = {
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
} as const;
