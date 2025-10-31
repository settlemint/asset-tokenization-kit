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
 * @see {@link https://tanstack.com/router/latest/docs/guide/data-loading} - TanStack Router data loading
 * @see {@link https://tanstack.com/query/latest/docs/react/guides/suspense} - React Query suspense mode
 */

import { ActionsCard } from "@/components/dashboard/actions-card/actions-card";
import { PendingActionsBanner } from "@/components/dashboard/actions-card/pending-actions-banner";
import { LatestEvents } from "@/components/dashboard/latest-events/latest-events";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/")({
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
   * @param root0
   * @param root0.context
   */
  loader: async ({ context: { queryClient, orpc } }) => {
    // User data should be loaded in parent _private route, but we need to ensure it exists
    // to handle cache misses, invalidation, or direct navigation
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({ input: { id: "default" } })
    );
    return { user, system };
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
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden p-6">
      <div className="flex h-full flex-col gap-6">
        <PendingActionsBanner />
        <div className="grid flex-1 grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-6">
              <ActionsCard />
              <ActionsCard />
            </div>
          </div>
          <div className="col-span-1 flex min-h-0 flex-col">
            <LatestEvents className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
