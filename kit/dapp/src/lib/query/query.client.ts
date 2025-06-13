import { setupReactQueryErrorHandling } from "@/lib/sentry/react-query-integration";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

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
const MUTATION_RETRY_DELAY = (attemptIndex: number) =>
  Math.min(1000 * 2 ** attemptIndex, 30000);

/**
 * Maximum number of retry attempts for failed requests.
 * Limited to 3 to balance reliability with performance.
 */
const MAX_RETRIES = 3;

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
 * QueryClient factory function.
 *
 * Creates a new QueryClient instance with optimized configuration
 * for the application's needs. Each call creates a fresh instance
 * to prevent data leakage between server-side requests.
 *
 * Configuration highlights:
 * - Smart retry logic that avoids retrying client errors (4xx)
 * - Offline-first networking for better UX
 * - Optimized refetch behavior to reduce unnecessary requests
 * - Exponential backoff for failed requests
 *
 * @returns Configured QueryClient instance
 */
const getQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Only refetch on window focus in production to reduce development noise
        refetchOnWindowFocus: process.env.NODE_ENV === "production",

        // Disable background refetching to conserve resources
        refetchIntervalInBackground: false,

        // Offline-first strategy for better UX when network is unreliable
        networkMode: "offlineFirst",

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

        /**
         * Optimized refetch behavior on component mount.
         *
         * Only refetches if this is the first time the query is being used
         * or if the data has been explicitly invalidated. This prevents
         * unnecessary refetches when navigating between pages.
         */
        refetchOnMount: (query) => {
          return query.state.dataUpdateCount === 0 || query.state.isInvalidated;
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

  return queryClient;
};

/**
 * Creates and configures a new QueryClient instance with persistence support.
 *
 * This function creates a QueryClient with localStorage persistence, enabling
 * the application to maintain query cache across browser sessions. The
 * persistence is configured to only store successful queries and includes
 * throttling to prevent excessive localStorage writes.
 *
 * Features:
 * - Persistent cache across browser sessions
 * - Throttled writes to prevent performance issues
 * - Only persists successful queries to avoid storing error states
 * - Graceful fallback if localStorage is unavailable
 * - Automatic cache expiration based on configured max age
 *
 * @returns A configured QueryClient instance with localStorage persistence
 *
 * @example
 * ```tsx
 * // Basic usage in app setup
 * const queryClient = makeQueryClient();
 *
 * // Use in your app root
 * <QueryClientProvider client={queryClient}>
 *   <App />
 * </QueryClientProvider>
 * ```
 *
 * @example
 * ```tsx
 * // In a Next.js app with SSR
 * function MyApp({ Component, pageProps }: AppProps) {
 *   const [queryClient] = useState(() => makeQueryClient());
 *
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <Component {...pageProps} />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export function makeQueryClient(): QueryClient {
  const client = getQueryClient();

  // Set up Sentry integration for error tracking
  setupReactQueryErrorHandling(client);

  // Only set up persistence in browser environment
  if (typeof window !== "undefined") {
    try {
      // Create localStorage persister with throttling
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        // Throttle writes to prevent excessive localStorage operations
        // that could impact performance, especially on slower devices
        throttleTime: 1000,
      });

      // Set up query persistence with selective dehydration
      void persistQueryClient({
        queryClient: client,
        persister,
        // Use the same max age as cache time for consistency
        maxAge: QUERY_CACHE_TIME,
        // Optimization: Only persist successful queries to avoid
        // storing error states or loading states that aren't useful
        // when the app is reloaded
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.state.status === "success";
          },
        },
      });
    } catch (error) {
      // Graceful fallback if localStorage is unavailable
      // (e.g., private browsing mode, quota exceeded, or disabled)
      logger.warn("Failed to set up localStorage persistence for QueryClient", {
        message: "Queries will not persist across sessions",
        error: error instanceof Error ? error.message : String(error),
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
      });
    }
  }

  return client;
}
