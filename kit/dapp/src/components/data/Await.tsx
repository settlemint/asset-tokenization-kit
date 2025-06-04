import { makeQueryClient } from "@/lib/orpc/query/query.client";
import {
  dehydrate,
  HydrationBoundary,
  type FetchQueryOptions,
} from "@tanstack/react-query";
import {
  Fragment,
  Suspense,
  type PropsWithChildren,
  type ReactNode,
} from "react";
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
 * @see {@link @/lib/orpc/query/query.client} - Query client configuration
 * @see {@link https://tanstack.com/query/latest/docs/framework/react/guides/ssr} - TanStack Query SSR guide
 */
export async function Await<TData = unknown, TError = Error>({
  children,
  queryOptions,
  error,
  fallback,
}: AwaitProps<TData, TError>) {
  // Create a fresh query client for server-side prefetching
  const queryClient = makeQueryClient();

  // Normalize query options to always work with an array for consistent processing
  const queries = Array.isArray(queryOptions) ? queryOptions : [queryOptions];

  // Prefetch all queries in parallel for optimal performance
  // This ensures all data is available before rendering begins
  await Promise.all(queries.map((query) => queryClient.prefetchQuery(query)));

  // Conditionally wrap in ErrorBoundary only if error fallback is provided
  // This avoids unnecessary error boundary overhead when not needed
  const MaybeErrorBoundary = error ? ErrorBoundary : Fragment;

  return (
    <MaybeErrorBoundary fallback={error}>
      {/* HydrationBoundary transfers server-prefetched data to client */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        {/* Suspense handles any remaining async operations during hydration */}
        <Suspense fallback={fallback}>{children}</Suspense>
      </HydrationBoundary>
    </MaybeErrorBoundary>
  );
}
