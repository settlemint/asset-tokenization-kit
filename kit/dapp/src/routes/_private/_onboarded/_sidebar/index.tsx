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

import { AssetOverviewSection } from "@/components/dashboard/asset-overview/asset-overview-section";
import { ClaimTopicsIssuersOverview } from "@/components/dashboard/claim-topics-issuers-overview/claim-topics-issuers-overview";
import { IdentityMetrics } from "@/components/dashboard/identity-metrics/identity-metrics";
import { IdentityProgress } from "@/components/dashboard/identity-progress/identity-progress";
import { LatestEvents } from "@/components/dashboard/latest-events/latest-events";
import { PortfolioDetails } from "@/components/dashboard/portfolio-details/portfolio-details";
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
  const { user, system } = Route.useLoaderData();
  return (
    <div className="p-6 space-y-8">
      <IdentityProgress user={user} />
      {system.userIdentity?.registered && <PortfolioDetails />}
      {system.userPermissions?.roles.tokenManager && <AssetOverviewSection />}
      {system.userPermissions?.roles.identityManager && <IdentityMetrics />}
      {system.userPermissions?.roles.claimPolicyManager && (
        <ClaimTopicsIssuersOverview />
      )}
      <LatestEvents />
    </div>
  );
}
