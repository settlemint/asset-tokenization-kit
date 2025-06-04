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

/**
 * Singleton QueryClient instance for browser environment.
 *
 * This variable holds the QueryClient instance that persists across
 * component re-renders and route navigations in the browser. It's
 * undefined initially and gets created on first access.
 *
 * The singleton pattern ensures:
 * - Query cache persists across navigations
 * - No unnecessary QueryClient re-creation
 * - Consistent state management in SPA behavior
 */
let browserQueryClient: QueryClient | undefined;

/**
 * Gets or creates a QueryClient instance with environment-aware behavior.
 *
 * This function implements different strategies for server and client environments:
 * - Server: Creates a fresh QueryClient for each request to prevent data leaking
 * - Client: Uses singleton pattern to maintain state across navigations
 *
 * The separation is crucial for:
 * - Security: Preventing user data leakage between server requests
 * - Performance: Avoiding unnecessary client-side re-initialization
 * - State management: Maintaining query cache across route changes
 *
 * @returns A QueryClient instance appropriate for the current environment
 *
 * @example
 * ```typescript
 * // Server-side: New client for each request
 * const serverClient = getQueryClient(); // Fresh instance
 *
 * // Client-side: Singleton pattern
 * const clientClient1 = getQueryClient(); // Creates singleton
 * const clientClient2 = getQueryClient(); // Returns same instance
 * ```
 */
function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: Always create a new client for each request to prevent
    // data leaking between different users' requests
    return makeQueryClient();
  }

  // Client: Use singleton pattern to maintain state across navigations
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

/**
 * Error fallback component for React Query errors.
 *
 * This component provides a user-friendly error interface when React Query
 * operations fail. It includes error logging, user feedback, and recovery
 * mechanisms to maintain a good user experience even when data fetching fails.
 *
 * Features:
 * - Production error logging for monitoring
 * - User-friendly error messaging
 * - Recovery mechanism via retry button
 * - Accessible design with proper styling
 *
 * @param error - The error that occurred during React Query operations
 * @param resetErrorBoundary - Function to reset the error boundary and retry
 *
 * @example
 * ```tsx
 * // Used automatically by ErrorBoundary
 * <ErrorBoundary FallbackComponent={QueryErrorFallback}>
 *   <QueryDependentComponent />
 * </ErrorBoundary>
 * ```
 */
function QueryErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production for debugging and analytics
    if (process.env.NODE_ENV === "production") {
      console.error("React Query Error:", error);
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

/**
 * Props for the QueryClientProvider component.
 */
interface QueryClientProviderProps extends PropsWithChildren {
  /**
   * Whether to show React Query Devtools in development.
   *
   * Controls the visibility of the React Query development tools that provide
   * insights into query states, cache contents, and performance metrics.
   * Only affects development builds; devtools are never shown in production.
   *
   * @default true
   */
  showDevtools?: boolean;

  /**
   * Initial open state for React Query Devtools.
   *
   * Determines whether the devtools panel should be open by default when
   * the application loads. Useful for debugging sessions where immediate
   * access to query information is needed.
   *
   * @default false
   */
  devtoolsInitialIsOpen?: boolean;

  /**
   * Custom error fallback component.
   *
   * Allows overriding the default error fallback component with a custom
   * implementation. The custom component should handle error display and
   * provide recovery mechanisms for users.
   *
   * @default QueryErrorFallback
   */
  errorFallback?: typeof QueryErrorFallback;
}

/**
 * Application-wide QueryClient provider with comprehensive error handling and development tools.
 *
 * This component serves as the root provider for React Query functionality throughout
 * the application. It implements environment-aware QueryClient management, error
 * boundaries for graceful error handling, and development tools integration for
 * improved developer experience.
 *
 * Key features:
 * - Environment-aware QueryClient instantiation (singleton on client, fresh on server)
 * - Comprehensive error boundary with user-friendly fallbacks
 * - Development tools integration with configurable visibility
 * - Automatic error logging and monitoring integration points
 * - TypeScript support with proper prop validation
 * - Test environment cleanup for reliable testing
 *
 * Architecture benefits:
 * - Prevents data leakage between server requests
 * - Maintains query cache across client-side navigations
 * - Provides consistent error handling across the application
 * - Enables powerful debugging capabilities in development
 * - Supports custom error handling strategies
 *
 * @param children - Child components that will have access to React Query
 * @param showDevtools - Whether to display development tools (development only)
 * @param devtoolsInitialIsOpen - Initial state of the devtools panel
 * @param errorFallback - Custom error fallback component
 *
 * @example
 * ```tsx
 * // Basic usage in app root
 * function App() {
 *   return (
 *     <QueryClientProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom configuration
 * <QueryClientProvider
 *   showDevtools={false}
 *   devtoolsInitialIsOpen={true}
 *   errorFallback={CustomErrorComponent}
 * >
 *   <App />
 * </QueryClientProvider>
 * ```
 *
 * @example
 * ```tsx
 * // In Next.js _app.tsx
 * function MyApp({ Component, pageProps }: AppProps) {
 *   return (
 *     <QueryClientProvider>
 *       <Component {...pageProps} />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 *
 * @see {@link @/lib/orpc/query/query.client} - QueryClient configuration
 * @see {@link https://tanstack.com/query/latest/docs/framework/react/reference/QueryClient} - QueryClient API reference
 */
export function QueryClientProvider({
  children,
  showDevtools = true,
  devtoolsInitialIsOpen = false,
  errorFallback: ErrorFallback = QueryErrorFallback,
}: QueryClientProviderProps) {
  // Use state to ensure we don't recreate the client on every render
  // This is crucial for maintaining query cache and avoiding unnecessary re-initialization
  const [queryClient] = useState(() => getQueryClient());

  // Clean up resources on unmount (primarily for testing environments)
  useEffect(() => {
    return () => {
      // Clear query cache in test environment to prevent test interference
      if (process.env.NODE_ENV === "test") {
        queryClient.getQueryCache().clear();
      }
    };
  }, [queryClient]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Clear the query cache and retry all queries when error boundary resets
        // This provides a clean slate for recovery from error states
        queryClient.clear();
        queryClient.resetQueries();
      }}
    >
      <ReactQueryClientProvider client={queryClient}>
        {children}
        {/* Conditionally render devtools only in development and when enabled */}
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
 * Hook to safely access the QueryClient instance outside of React Query hooks.
 *
 * This hook provides direct access to the QueryClient instance for advanced
 * use cases where the standard React Query hooks are insufficient. It should
 * be used sparingly and only when necessary, as the standard hooks provide
 * better integration with React's lifecycle and error handling.
 *
 * Common use cases:
 * - Manual cache manipulation
 * - Imperative query triggering
 * - Custom query invalidation logic
 * - Integration with non-React code
 *
 * @returns The current QueryClient instance
 *
 * @example
 * ```tsx
 * function useCustomInvalidation() {
 *   const queryClient = useAppQueryClient();
 *
 *   const invalidateUserData = useCallback(() => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] });
 *   }, [queryClient]);
 *
 *   return { invalidateUserData };
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Manual cache updates
 * function useOptimisticUpdate() {
 *   const queryClient = useAppQueryClient();
 *
 *   const updateUserOptimistically = (userId: string, data: UserData) => {
 *     queryClient.setQueryData(['users', userId], data);
 *   };
 *
 *   return { updateUserOptimistically };
 * }
 * ```
 *
 * @see {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQueryClient} - Standard useQueryClient hook
 */
export function useAppQueryClient(): QueryClient {
  return getQueryClient();
}
