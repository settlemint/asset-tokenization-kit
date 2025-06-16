import { makeQueryClient } from "@/lib/query/query.client";
import type { FetchQueryOptions } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import type { PropsWithChildren, ReactNode } from "react";
import { AwaitClientWrapper } from "./AwaitClientWrapper";

/**
 * Props for the Await component.
 *
 * @template TData - The expected data type returned by the query
 * @template TError - The expected error type that might be thrown
 */
type AwaitProps<TData = unknown, TError = Error> = PropsWithChildren<{
  /**
   * Query options for data prefetching.
   *
   * Can be a single query or an array of queries to prefetch in parallel.
   * Each query option should include the query key, query function, and
   * any additional configuration needed for data fetching.
   */
  queryOptions:
    | FetchQueryOptions<TData, TError>
    | FetchQueryOptions<TData, TError>[];

  /**
   * Error fallback UI component.
   *
   * Optional React node to display when an error occurs during data fetching
   * or rendering. If not provided, errors will bubble up to parent error
   * boundaries. When provided, wraps children in an ErrorBoundary.
   */
  error?: ReactNode;

  /**
   * Loading fallback UI component.
   *
   * Optional React node to display while the component is suspended.
   * This is shown during the initial render before hydration completes
   * and during any subsequent suspense states.
   */
  fallback?: ReactNode;

  /**
   * Custom error handler function.
   *
   * Called when an error occurs during prefetching. Can be used for
   * logging, monitoring, or custom error recovery logic.
   */
  onError?: (error: TError) => void;

  /**
   * Whether to skip prefetching entirely.
   *
   * Useful for conditional data fetching based on authentication state
   * or feature flags. When true, renders children immediately without
   * prefetching or hydration.
   */
  skip?: boolean;

  /**
   * Custom dehydrate options.
   *
   * Allows customization of which queries are included in the dehydrated
   * state. By default, only successful queries are dehydrated.
   */
  dehydrateOptions?: Parameters<typeof dehydrate>[1];

  /**
   * Error boundary reset keys.
   *
   * Array of values that, when changed, will reset the error boundary
   * and retry rendering. Useful for recovering from errors based on
   * external state changes.
   */
  resetKeys?: (string | number)[];

  /**
   * Custom error fallback component.
   *
   * Receives error and reset function as props. Provides more control
   * than the simple error ReactNode prop.
   */
  errorFallbackComponent?: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
}>;

/**
 * Server-side data prefetching component with hydration support.
 *
 * The Await component enables server-side data prefetching for React Query,
 * allowing data to be fetched on the server and seamlessly hydrated on the
 * client. This improves initial page load performance and provides better
 * SEO by ensuring data is available during server-side rendering.
 *
 * Key features:
 * - Server-side data prefetching with React Query
 * - Automatic client-side hydration of prefetched data
 * - Support for single or multiple parallel queries
 * - Optional error boundary integration
 * - Suspense integration for loading states
 * - Type-safe query options and data handling
 * - Conditional prefetching with skip option
 * - Custom error handling and recovery
 * - Configurable dehydration options
 *
 * The component works by:
 * 1. Creating a query client on the server
 * 2. Prefetching specified queries in parallel
 * 3. Dehydrating the query cache for client transfer
 * 4. Wrapping children in HydrationBoundary for seamless hydration
 * 5. Providing error and loading boundaries as needed
 *
 * @template TData - The expected data type returned by the query
 * @template TError - The expected error type that might be thrown
 *
 * @param props - Component props including query options and UI fallbacks
 * @returns Promise resolving to JSX with prefetched data and hydration setup
 *
 * @example
 * ```tsx
 * // Basic usage with single query
 * <Await
 *   queryOptions={{
 *     queryKey: ['user', userId],
 *     queryFn: () => fetchUser(userId),
 *   }}
 *   fallback={<UserSkeleton />}
 *   error={<ErrorMessage />}
 * >
 *   <UserProfile />
 * </Await>
 * ```
 *
 * @example
 * ```tsx
 * // Multiple queries with custom error handling
 * <Await
 *   queryOptions={[
 *     { queryKey: ['user'], queryFn: fetchUser },
 *     { queryKey: ['posts'], queryFn: fetchPosts },
 *   ]}
 *   onError={(error) => console.error('Prefetch failed:', error)}
 *   errorFallbackComponent={CustomErrorFallback}
 * >
 *   <Dashboard />
 * </Await>
 * ```
 *
 * @see {@link @/lib/orpc/query/query.client} - Query client configuration
 * @see {@link https://tanstack.com/query/latest/docs/framework/react/guides/ssr} - TanStack Query SSR guide
 */
export async function Await<TData = unknown, TError = Error>({
  children,
  queryOptions,
  error,
  fallback,
  onError,
  skip = false,
  dehydrateOptions,
  resetKeys,
  errorFallbackComponent,
}: AwaitProps<TData, TError>) {
  // Skip prefetching if requested
  if (skip) {
    return <>{children}</>;
  }

  // Create a fresh query client for server-side prefetching
  const queryClient = makeQueryClient();

  // Normalize query options to always work with an array for consistent processing
  const queries = Array.isArray(queryOptions) ? queryOptions : [queryOptions];

  try {
    // Prefetch all queries in parallel for optimal performance
    // This ensures all data is available before rendering begins
    await Promise.all(
      queries.map(async (query) => {
        try {
          await queryClient.prefetchQuery(query);
        } catch (error) {
          // Call custom error handler if provided
          if (onError) {
            onError(error as TError);
          }
          // Re-throw to be caught by outer try-catch
          throw error;
        }
      })
    );
  } catch (prefetchError) {
    // Log error in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("[Await] Prefetch error:", prefetchError);
    }

    // If we have an error fallback prop configured, render it instead of throwing
    if (error || errorFallbackComponent) {
      // If errorFallbackComponent is provided, use it
      if (errorFallbackComponent) {
        const ErrorComponent = errorFallbackComponent;
        return (
          <ErrorComponent
            error={prefetchError as Error}
            resetErrorBoundary={() => {
              // In a server component context, we can't really reset
              // This would need to be handled by client-side navigation
            }}
          />
        );
      }

      // If only error prop (ReactNode) is provided, render it directly
      if (error) {
        return <>{error}</>;
      }
    }

    // Re-throw if no error handling is configured
    throw prefetchError;
  }

  // Default dehydrate options that only include successful queries
  const defaultDehydrateOptions = {
    shouldDehydrateQuery: (query: any) => query.state.status === "success",
  };

  // Dehydrate the query cache for client transfer
  const dehydratedState = dehydrate(
    queryClient,
    dehydrateOptions || defaultDehydrateOptions
  );

  return (
    <AwaitClientWrapper
      dehydratedState={dehydratedState}
      error={error}
      fallback={fallback}
      resetKeys={resetKeys}
      errorFallbackComponent={errorFallbackComponent}
    >
      {children}
    </AwaitClientWrapper>
  );
}
