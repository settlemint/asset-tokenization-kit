/**
 * TanStack Query Client Configuration
 *
 * This module configures and exports the TanStack Query (formerly React Query)
 * client used throughout the application for server state management. The client
 * handles data fetching, caching, synchronization, and updates with a powerful
 * set of features optimized for modern React applications.
 *
 * Key features configured:
 * - Intelligent caching with configurable stale times
 * - Automatic background refetching
 * - Request deduplication
 * - Optimistic updates support
 * - Retry logic with exponential backoff
 * - Offline support with request queuing
 * - Window focus refetching
 * - Network status monitoring
 * - Cross-tab synchronization via Broadcast Channel API
 * - Global UNAUTHORIZED error handling
 *
 * The configuration is optimized for blockchain applications where:
 * - Data freshness is important but not real-time critical
 * - Network requests can be expensive (RPC calls)
 * - Users expect responsive UI with cached data
 * - Background updates maintain data consistency
 * @example
 * ```typescript
 * // Using the query client in a component
 * import { useQuery } from '@tanstack/react-query';
 * import { orpc } from '@/orpc';
 *
 * function UserProfile() {
 *   const { data, isLoading, error } = useQuery({
 *     queryKey: ['user', 'profile'],
 *     queryFn: () => orpc.user.me()
 *   });
 * }
 * ```
 * @see {@link https://tanstack.com/query} - TanStack Query documentation
 * @see {@link ../orpc} - ORPC client integration
 */

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { parse, stringify } from "superjson";

const logger = createLogger();

/**
 * Query cache configuration constants.
 *
 * These constants define the caching behavior and performance characteristics
 * of the TanStack Query client. They are centralized here for easy maintenance
 * and consistent behavior across the application.
 */

/**
 * Duration to keep cached data in memory and storage.
 * Set to 24 hours to balance performance with data freshness.
 */
const QUERY_CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Time before cached data is considered stale and needs refetching.
 * Set to 5 minutes to ensure reasonable data freshness for most use cases.
 */
const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Exponential backoff retry delay calculation.
 * Implements exponential backoff with a maximum delay cap to prevent
 * excessive wait times while still providing reasonable retry intervals.
 * @param attemptIndex
 */
const MUTATION_RETRY_DELAY = (attemptIndex: number): number =>
  Math.min(1000 * 2 ** attemptIndex, 30000);

/**
 * Maximum number of retry attempts for failed requests.
 * Limited to 3 to balance reliability with performance.
 */
const MAX_RETRIES = process.env.NODE_ENV === "production" ? 3 : 1; // during development, we don't want to retry too many times

/**
 * Enhanced error interface for query operations.
 *
 * Extends the standard Error interface with additional properties
 * commonly found in HTTP and API errors, enabling more sophisticated
 * error handling and retry logic.
 */
interface QueryError extends Error {
  /** Error code from the API or HTTP status */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error data from the API response */
  data?: unknown;
}

/**
 * Global error handler for UNAUTHORIZED errors.
 * Redirects to the sign-in page when authentication fails.
 * @param error
 */
const handleUnauthorizedError = (error: unknown) => {
  const queryError = error as QueryError;
  if (
    (queryError.code === "UNAUTHORIZED" || queryError.status === 401) &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/auth/") &&
    !window.location.pathname.startsWith("/api/auth")
  ) {
    window.location.href = "/auth/sign-in";
  }
};

/**
 * Query cache with global error handling.
 * Catches all query errors and handles UNAUTHORIZED globally.
 */
const queryCache = new QueryCache({
  onError: (error, query) => {
    logger.error("Query error", {
      error,
      queryKey: query.queryKey,
      queryHash: query.queryHash,
    });
    handleUnauthorizedError(error);
  },
});

/**
 * Mutation cache with global error handling.
 * Catches all mutation errors and handles UNAUTHORIZED globally.
 */
const mutationCache = new MutationCache({
  onError: (error, variables, _context, mutation) => {
    logger.error("Mutation error", {
      error,
      mutationKey: mutation.options.mutationKey,
      variables,
    });
    handleUnauthorizedError(error);
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Only refetch on window focus in production to reduce development noise
      refetchOnWindowFocus: process.env.NODE_ENV === "production",

      // Disable background refetching to conserve resources
      refetchIntervalInBackground: false,

      // Offline-first strategy for better UX when network is unreliable
      networkMode: "offlineFirst",
      structuralSharing: true,

      /**
       * Smart retry logic for queries.
       *
       * Avoids retrying client errors (4xx) except for 408 Request Timeout,
       * which is often a temporary network issue. Server errors (5xx) and
       * network errors are retried with exponential backoff.
       * @param failureCount
       * @param error
       */
      retry: (failureCount, error) => {
        const queryError = error as QueryError;
        // Don't retry on UNAUTHORIZED errors
        if (queryError.code === "UNAUTHORIZED" || queryError.status === 401) {
          return false;
        }
        // Don't retry on 4xx errors (except 408 Request Timeout)
        if (
          queryError.status &&
          queryError.status >= 400 &&
          queryError.status < 500 &&
          queryError.status !== 408
        ) {
          return false;
        }
        return failureCount < MAX_RETRIES;
      },

      // Exponential backoff for retry attempts
      retryDelay: MUTATION_RETRY_DELAY,

      // How long to keep data in cache
      gcTime: QUERY_CACHE_TIME,

      // How long before data is considered stale
      staleTime: QUERY_STALE_TIME,

      placeholderData: (previousData: unknown) => previousData,

      /**
       * Optimized refetch behavior on component mount.
       *
       * Only refetches if this is the first time the query is being used
       * or if the data has been explicitly invalidated. This prevents
       * unnecessary refetches when navigating between pages.
       * @param query
       */
      refetchOnMount: (query) => {
        // Always refetch if invalidated
        if (query.state.isInvalidated) return true;
        // Otherwise, only refetch if this is the first fetch
        return query.state.dataUpdateCount === 0;
      },
    },
    mutations: {
      /**
       * Smart retry logic for mutations.
       *
       * Similar to queries, but more conservative since mutations
       * can have side effects. Only retries on server errors and
       * network issues, never on client errors.
       * @param failureCount
       * @param error
       */
      retry: (failureCount, error) => {
        const mutationError = error as QueryError;
        // Don't retry on UNAUTHORIZED errors
        if (
          mutationError.code === "UNAUTHORIZED" ||
          mutationError.status === 401
        ) {
          return false;
        }
        // Don't retry on 4xx errors
        if (
          mutationError.status &&
          mutationError.status >= 400 &&
          mutationError.status < 500
        ) {
          return false;
        }
        return failureCount < MAX_RETRIES;
      },

      // Exponential backoff for mutation retries
      retryDelay: MUTATION_RETRY_DELAY,

      // Offline-first strategy for mutations too
      networkMode: "offlineFirst",
    },
  },
});

/**
 * Storage persister for offline support
 */
const persister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "atk-query-cache",
  throttleTime: 1000,
  serialize: (data) => stringify(data),
  deserialize: async (data) => parse(data),
});

/**
 * Persist queries for offline support and sync across tabs
 */
if (typeof window !== "undefined" && process.env.NODE_ENV !== "development") {
  // Check and clear stale cache based on build ID
  // In development, use a stable build ID to avoid unnecessary cache busting
  const buildId = process.env.BUILD_ID ?? new Date().toISOString();

  // Enable query persistence for offline support
  void persistQueryClient({
    queryClient,
    persister,
    maxAge: QUERY_CACHE_TIME,
    buster: buildId,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Only persist successful queries
        return query.state.status === "success";
      },
    },
  });
}

if (typeof window !== "undefined") {
  /**
   * Set up broadcast channel for cross-tab synchronization.
   *
   * This enables real-time synchronization of query cache across
   * multiple browser tabs/windows, ensuring consistent data state
   * and preventing duplicate API calls when switching between tabs.
   *
   * Features:
   * - Automatic cache updates across all tabs
   * - Optimistic updates propagation
   * - Query invalidation synchronization
   * - Mutation state sharing
   *
   * Note: Uses the experimental broadcast client plugin which
   * leverages the Broadcast Channel API for cross-tab communication.
   */

  broadcastQueryClient({
    queryClient,
    broadcastChannel: "atk-query-sync",
  });
}
