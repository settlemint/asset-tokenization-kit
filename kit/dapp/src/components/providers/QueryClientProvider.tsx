"use client";

import { makeQueryClient } from "@/lib/orpc/query/query.client";
import {
  type QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type PropsWithChildren, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Singleton pattern for browser query client with proper typing
let browserQueryClient: QueryClient | undefined;

/**
 * Gets or creates a QueryClient instance.
 *
 * On the server, a new QueryClient is created for each request to prevent
 * data leaking between users. On the client, we use a singleton to maintain
 * state across navigations.
 *
 * @returns A QueryClient instance appropriate for the current environment
 */
function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: Always create a new client for each request
    return makeQueryClient();
  }

  // Client: Use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

/**
 * Error fallback component for React Query errors
 */
function QueryErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      console.error("React Query Error:", error);
      // TODO: Send to error monitoring service (e.g., Sentry)
    }
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <h2 className="mb-4 text-xl font-semibold text-destructive">
        Something went wrong
      </h2>
      <p className="mb-6 text-center text-muted-foreground">
        {error.message || "An unexpected error occurred while loading data."}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

interface QueryClientProviderProps extends PropsWithChildren {
  /**
   * Whether to show React Query Devtools in development
   * @default true
   */
  showDevtools?: boolean;
  /**
   * Initial open state for React Query Devtools
   * @default false
   */
  devtoolsInitialIsOpen?: boolean;
  /**
   * Custom error fallback component
   */
  errorFallback?: typeof QueryErrorFallback;
}

/**
 * Provides a QueryClient context for the application with error boundaries
 * and development tools.
 *
 * Features:
 * - Singleton pattern on client, fresh instance on server
 * - Error boundary for React Query errors
 * - Development tools in non-production environments
 * - TypeScript support with proper prop types
 *
 * @example
 * ```tsx
 * <QueryClientProvider showDevtools={false}>
 *   <App />
 * </QueryClientProvider>
 * ```
 */
export function QueryClientProvider({
  children,
  showDevtools = true,
  devtoolsInitialIsOpen = false,
  errorFallback: ErrorFallback = QueryErrorFallback,
}: QueryClientProviderProps) {
  // Use state to ensure we don't recreate the client on every render
  const [queryClient] = useState(() => getQueryClient());

  // Clean up on unmount (only relevant for testing)
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === "test") {
        queryClient.clear();
      }
    };
  }, [queryClient]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Clear the query cache and retry
        queryClient.resetQueries();
      }}
    >
      <ReactQueryClientProvider client={queryClient}>
        {children}
        {showDevtools && process.env.NODE_ENV !== "production" && (
          <ReactQueryDevtools
            initialIsOpen={devtoolsInitialIsOpen}
            buttonPosition="bottom-right"
          />
        )}
      </ReactQueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * Hook to safely access the QueryClient outside of React Query hooks
 * @returns The current QueryClient instance
 */
export function useQueryClientInstance(): QueryClient {
  return getQueryClient();
}
