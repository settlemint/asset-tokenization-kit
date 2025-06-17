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
 *
 * The configuration is optimized for blockchain applications where:
 * - Data freshness is important but not real-time critical
 * - Network requests can be expensive (RPC calls)
 * - Users expect responsive UI with cached data
 * - Background updates maintain data consistency
 *
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
 *
 * @see {@link https://tanstack.com/query} - TanStack Query documentation
 * @see {@link ../orpc} - ORPC client integration
 */

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import superjson from "superjson";

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

export const queryClient = new QueryClient({
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
       */
      retry: (failureCount, error) => {
        const queryError = error as QueryError;
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
       */
      retry: (failureCount, error) => {
        const mutationError = error as QueryError;
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
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "atk-query-cache",
  throttleTime: 1000,
  serialize: (data) => superjson.stringify(data),
  deserialize: (data) => superjson.parse(data),
});

/**
 * Persist queries for offline support
 */
if (typeof window !== "undefined") {
  void persistQueryClient({
    queryClient,
    persister,
    maxAge: QUERY_CACHE_TIME,
    buster: process.env.BUILD_ID ?? "",
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Only persist successful queries
        return query.state.status === "success";
      },
    },
  });
}
