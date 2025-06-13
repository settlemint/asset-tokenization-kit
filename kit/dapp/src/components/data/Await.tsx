import { makeQueryClient } from "@/lib/query/query.client";
import type { FetchQueryOptions } from "@tanstack/react-query";
import type { PropsWithChildren, ReactNode } from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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
   * boundaries.
   */
  error?: ReactNode;

  /**
   * Loading fallback UI component.
   *
   * Optional React node to display while the component is suspended.
   * This is shown during the async data fetching.
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
   * prefetching.
   */
  skip?: boolean;
}>;

/**
 * Default error fallback component.
 */
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
      <p className="text-center text-sm text-destructive">
        {error.message || "An error occurred while loading data"}
      </p>
    </div>
  );
}

/**
 * Server-side data prefetching component.
 *
 * The Await component enables server-side data prefetching for React Query,
 * allowing data to be fetched on the server before rendering. This improves
 * initial page load performance and provides better SEO by ensuring data is
 * available during server-side rendering.
 *
 * Key features:
 * - Server-side data prefetching with React Query
 * - Support for single or multiple parallel queries
 * - Built-in error boundary and suspense boundary
 * - Type-safe query options and data handling
 * - Conditional prefetching with skip option
 * - Minimal client-side JavaScript
 *
 * The component works by:
 * 1. Creating a query client on the server
 * 2. Prefetching specified queries in parallel
 * 3. Storing the data in the query cache
 * 4. Rendering children with access to the prefetched data
 * 5. Wrapping in Suspense and ErrorBoundary as needed
 *
 * @template TData - The expected data type returned by the query
 * @template TError - The expected error type that might be thrown
 *
 * @param props - Component props including query options and UI fallbacks
 * @returns Promise resolving to JSX with prefetched data
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
 * // Multiple queries
 * <Await
 *   queryOptions={[
 *     { queryKey: ['user'], queryFn: fetchUser },
 *     { queryKey: ['posts'], queryFn: fetchPosts },
 *   ]}
 * >
 *   <Dashboard />
 * </Await>
 * ```
 */
export async function Await<TData = unknown, TError = Error>({
  children,
  queryOptions,
  error,
  fallback,
  onError,
  skip = false,
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
    return (
      <>{error || <DefaultErrorFallback error={prefetchError as Error} />}</>
    );
  }

  // Wrap children with error boundary if error fallback is provided
  const content = error ? (
    <ErrorBoundary fallback={error}>{children}</ErrorBoundary>
  ) : (
    children
  );

  return <Suspense fallback={fallback}>{content}</Suspense>;
}
