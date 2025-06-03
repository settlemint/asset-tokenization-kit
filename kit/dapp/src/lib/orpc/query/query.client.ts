import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { cache } from "react";

// Constants for better maintainability
const QUERY_CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours
const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const MUTATION_RETRY_DELAY = (attemptIndex: number) =>
  Math.min(1000 * 2 ** attemptIndex, 30000);
const MAX_RETRIES = 3;

// Type for error with proper structure
interface QueryError extends Error {
  code?: string;
  status?: number;
  data?: unknown;
}

const getQueryClient = cache(() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        refetchIntervalInBackground: false,
        networkMode: "offlineFirst",
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
        retryDelay: MUTATION_RETRY_DELAY,
        gcTime: QUERY_CACHE_TIME,
        staleTime: QUERY_STALE_TIME,
        // Prevent refetching on mount if data is fresh
        refetchOnMount: (query) => {
          return query.state.dataUpdateCount === 0 || query.state.isInvalidated;
        },
      },
      mutations: {
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
        retryDelay: MUTATION_RETRY_DELAY,
        networkMode: "offlineFirst",
      },
    },
  });

  return queryClient;
});

/**
 * Creates and configures a new QueryClient instance with persistence support.
 *
 * @returns A configured QueryClient instance with localStorage persistence
 *
 * @example
 * ```tsx
 * const queryClient = makeQueryClient();
 *
 * // Use in your app
 * <QueryClientProvider client={queryClient}>
 *   <App />
 * </QueryClientProvider>
 * ```
 */
export function makeQueryClient(): QueryClient {
  const client = getQueryClient();

  if (typeof window !== "undefined") {
    try {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        // Add throttle to prevent excessive writes
        throttleTime: 1000,
      });

      void persistQueryClient({
        queryClient: client,
        persister,
        maxAge: QUERY_CACHE_TIME,
        // Only persist successful queries
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.state.status === "success";
          },
        },
      });
    } catch (error) {
      // Handle localStorage errors (e.g., quota exceeded)
      console.warn("Failed to set up query persistence:", error);
    }
  }

  return client;
}
