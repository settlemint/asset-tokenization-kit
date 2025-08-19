import { getEthereumAddress } from "@atk/zod/validators/ethereum-address";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { createDataTableSearchParams } from "@/components/data-table/utils/data-table-url-state";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenHoldersTable } from "@/components/tables/token-holders";

/**
 * Route configuration for token holders page
 *
 * This route displays all token holders and their balances for a specific token.
 * The route is authenticated and requires the user to be onboarded.
 *
 * Route path: `/token/{factoryAddress}/{tokenAddress}/holders`
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/token/$factoryAddress/$tokenAddress/holders',
 *   params: {
 *     factoryAddress: '0x1234...',
 *     tokenAddress: '0x5678...'
 *   }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/holders"
)({
  validateSearch: createDataTableSearchParams({ defaultPageSize: 20 }),
  loader: ({ context: { queryClient, orpc }, params: { tokenAddress } }) => {
    // Prefetch holders data for better UX
    void queryClient.prefetchQuery(
      orpc.token.holders.queryOptions({
        input: { tokenAddress: getEthereumAddress(tokenAddress) },
      })
    );
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Token holders page component
 *
 * Displays a data table with all token holders showing:
 * - Total balance value
 * - Available balance for transfers
 * - Frozen/locked balance amount
 * - Frozen status indicator
 *
 * @returns Data table component for token holders
 */
function RouteComponent() {
  const { asset } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });

  return <TokenHoldersTable token={asset} />;
}
