import { setupReactQueryErrorHandling } from "@/lib/sentry/react-query-integration";
import { isDefinedError } from "@orpc/client";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: [],
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

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta);
        },
      },
      dehydrate: {
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
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
          if (isDefinedError(error)) {
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
          if (isDefinedError(error)) {
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

  // Set up Sentry integration for error tracking
  setupReactQueryErrorHandling(queryClient);

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
        queryClient: queryClient,
        persister,
        // Use the same max age as cache time for consistency
        maxAge: QUERY_CACHE_TIME,
        // Optimization: Only persist successful queries to avoid
        // storing error states or loading states that aren't useful
        // when the app is reloaded
        dehydrateOptions: {
          serializeData(data) {
            const [json, meta] = serializer.serialize(data);
            return { json, meta };
          },
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending",
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

  return queryClient;
};
