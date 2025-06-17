/**
 * Private Dashboard Home Page
 *
 * This module defines the home page for authenticated users, serving as the
 * landing page after successful authentication. It demonstrates various data
 * fetching patterns available in TanStack Router with React Query.
 *
 * The page showcases:
 * - Accessing authenticated user data from route context
 * - Different data loading strategies (prefetch vs. ensure)
 * - Internationalization with react-i18next
 * - Suspense-based data fetching with React Query
 *
 * @see {@link https://tanstack.com/router/latest/docs/guide/data-loading} - TanStack Router data loading
 * @see {@link https://tanstack.com/query/latest/docs/react/guides/suspense} - React Query suspense mode
 */

import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/")({
  /**
   * Data loader that runs when navigating to this route.
   *
   * Demonstrates different data loading strategies:
   * 1. Accessing user data from parent route context
   * 2. Prefetching data for better perceived performance
   * 3. Ensuring data is loaded before rendering (blocking)
   * 4. Returning data or promises for component consumption
   *
   * The current implementation uses prefetchQuery for non-blocking
   * data loading, allowing the page to render while data loads.
   */
  loader: async ({ context }) => {
    // User data is available from parent _private route
    // const user: User = context.user;

    // Non-blocking prefetch - loads data in background
    // Best for non-critical data that can load after initial render
    void context.queryClient.prefetchQuery(
      orpc.system.list.queryOptions({ input: {} })
    );

    await context.queryClient.ensureQueryData(orpc.user.me.queryOptions());

    // Alternative: Blocking data load - ensures data before render
    // Best for critical data needed for initial render
    // await context.queryClient.ensureQueryData(
    //   orpc.system.list.queryOptions({ input: {} })
    // );

    // Alternative: Return data for component access
    // return await something // Access via Route.useLoaderData()
    // return promise // Use with <Suspense><Await> from @tanstack/react-router
  },
  component: Home,
});

/**
 * Home page component for authenticated users.
 *
 * Displays a welcome message and system data fetched via ORPC.
 * Uses suspense mode for data fetching, which integrates with
 * React Suspense boundaries for loading states.
 */
function Home() {
  const { data: systems } = useSuspenseQuery(
    orpc.system.list.queryOptions({ input: {} })
  );
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  return (
    <div className="p-2">
      <h3>{user.name}</h3>
      <pre>{JSON.stringify(systems, null, 2)}</pre>
    </div>
  );
}
