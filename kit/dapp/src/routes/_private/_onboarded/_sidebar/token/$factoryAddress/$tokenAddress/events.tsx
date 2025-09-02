import { createDataTableSearchParams } from "@/components/data-table/utils/data-table-url-state";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenEventsTable } from "@/components/tables/token-events";
import { orpc } from "@/orpc/orpc-client";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

/**
 * Route configuration for token events page
 *
 * This route displays all events for a specific token, providing a complete
 * audit trail of all actions performed on the token contract.
 * The route is authenticated and requires the user to be onboarded.
 *
 * Route path: `/token/{factoryAddress}/{tokenAddress}/events`
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/token/$factoryAddress/$tokenAddress/events',
 *   params: {
 *     factoryAddress: '0x1234...',
 *     tokenAddress: '0x5678...'
 *   }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/events"
)({
  validateSearch: createDataTableSearchParams({ defaultPageSize: 20 }),
  loader: ({ context: { queryClient, orpc }, params: { tokenAddress } }) => {
    // Prefetch events data for better UX
    void queryClient.prefetchQuery(
      orpc.token.events.queryOptions({
        input: { tokenAddress: getEthereumAddress(tokenAddress) },
      })
    );
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Token events page component
 *
 * Displays a data table with all token events showing:
 * - Event timestamp
 * - Event name/type
 * - Transaction details
 * - Sender address
 * - Event-specific parameters
 *
 * @returns Data table component for token events
 */
function RouteComponent() {
  const { asset: loaderAsset } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });
  // Keep data fresh so UI reacts to invalidations after mutations
  const { data: queriedAsset } = useQuery(
    orpc.token.read.queryOptions({ input: { tokenAddress: loaderAsset.id } })
  );

  const asset = queriedAsset ?? loaderAsset;
  return <TokenEventsTable token={asset} />;
}
