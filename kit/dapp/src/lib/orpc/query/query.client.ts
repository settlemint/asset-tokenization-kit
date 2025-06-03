import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { cache } from "react";
import { toast } from "sonner";

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

// Enhanced error handler with more context
function handleQueryError(error: unknown): void {
  const queryError = error as QueryError;

  // Don't show toast for network errors that will be retried
  if (queryError.code === "NETWORK_ERROR") {
    return;
  }

  // Provide more specific error messages based on error type
  const errorMessage =
    queryError.status === 401
      ? "Authentication required. Please log in."
      : queryError.status === 403
        ? "You don't have permission to perform this action."
        : queryError.status === 404
          ? "The requested resource was not found."
          : queryError.status && queryError.status >= 500
            ? "Server error. Please try again later."
            : queryError.message || "An unexpected error occurred";

  toast.error(errorMessage, {
    action:
      queryError.status !== 401
        ? {
            label: "Retry",
            onClick: () => {
              // Get the query client instance to invalidate queries
              const client = getQueryClient();
              client.invalidateQueries();
            },
          }
        : undefined,
    duration: queryError.status && queryError.status >= 500 ? 10000 : 5000,
  });
}

const getQueryClient = cache(() => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
      onSuccess: () => {
        // Optional: Clear any error toasts on successful refetch
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Handle mutation-specific errors
        if (mutation.options.onError) {
          return; // Let the mutation handle its own error
        }
        handleQueryError(error);
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        // Show success toast for mutations if configured
        if (mutation.meta?.successMessage) {
          toast.success(mutation.meta.successMessage as string);
        }
      },
    }),
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

  // Set up global error boundary integration
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.name === "QueryError") {
        event.preventDefault();
        handleQueryError(event.reason);
      }
    });
  }

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

/**
 * Hook to get the current QueryClient instance
 * @returns The QueryClient instance
 */
export function useQueryClient(): QueryClient {
  return getQueryClient();
}
