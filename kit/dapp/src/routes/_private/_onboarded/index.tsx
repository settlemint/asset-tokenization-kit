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

import { CreateDepositForm } from "@/components/asset-designer/deposit/form";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";

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
   * @param root0
   * @param root0.context
   */
  loader: async ({ context }) => {
    // User data should be loaded in parent _private route, but we need to ensure it exists
    // to handle cache misses, invalidation, or direct navigation
    const user = await context.queryClient.ensureQueryData(
      orpc.user.me.queryOptions()
    );

    // Ensure systems data is loaded
    const systems = await context.queryClient.ensureQueryData(
      orpc.system.list.queryOptions({ input: {} })
    );

    return { user, systems };
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
  const { user, systems } = Route.useLoaderData();

  const { mutate: grantDeployerRole, isPending: isGrantingRole } = useMutation({
    mutationFn: async () => {
      return await orpc.token.factoryGrantRole.call({
        account: user.wallet,
      });
    },
    onSuccess: (transactionHash) => {
      toast.success("Deployer role granted successfully!");
      console.log("Grant role transaction hash:", transactionHash);
    },
    onError: (error) => {
      toast.error("Failed to grant deployer role");
      console.error("Grant role error:", error);
    },
  });

  const grantDeployerRoleFn = useCallback(() => {
    grantDeployerRole();
  }, [grantDeployerRole]);

  return (
    <div className="p-2">
      <h3>{user.name}</h3>
      <div className="mb-4 p-2 rounded">
        <h4>Debug Info:</h4>
        <pre>
          {JSON.stringify(
            {
              wallet: user.wallet,
              onboardingFinished: user.isOnboarded,
              userId: user.id,
            },
            null,
            2
          )}
        </pre>
      </div>
      <pre>{JSON.stringify(systems, null, 2)}</pre>

      <div className="mb-4">
        <Button onClick={grantDeployerRoleFn} variant="outline">
          {isGrantingRole ? "Granting..." : "Grant Deployer Role to Me"}
        </Button>
      </div>

      <CreateDepositForm />
    </div>
  );
}
