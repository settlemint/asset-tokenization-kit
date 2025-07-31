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

import { useSettings } from "@/hooks/use-settings";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
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

    return { user };
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
  const { user } = Route.useLoaderData();
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");

  // Get system details using the system address from settings
  const { data: systemDetails, isLoading: isLoadingSystem } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
      enabled: Boolean(systemAddress),
    })
  );

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
        <div className="mb-4 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <pre className="text-sm">
            {JSON.stringify(
              {
                wallet: user.wallet,
                userId: user.id,
                systemAddress: systemAddress,
              },
              null,
              2
            )}
          </pre>
        </div>
        {isLoadingSystem ? (
          <div className="text-sm">Loading system details...</div>
        ) : systemDetails ? (
          <pre className="text-sm bg-muted p-4 rounded-lg">
            {JSON.stringify(systemDetails, null, 2)}
          </pre>
        ) : (
          <div className="text-sm text-muted-foreground">
            No system found at address: {systemAddress}
          </div>
        )}
      </div>
    </div>
  );
}
