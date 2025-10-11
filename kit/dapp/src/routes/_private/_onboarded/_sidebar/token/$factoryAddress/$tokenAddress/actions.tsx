import { ActionsOverview } from "@/components/actions/actions-overview";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/actions"
)({
  loader: ({ context: { queryClient, orpc }, params: { tokenAddress } }) => {
    void queryClient.prefetchQuery(
      orpc.actions.list.queryOptions({
        input: { target: getEthereumAddress(tokenAddress) },
      })
    );
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Token actions page component
 *
 * Displays the Actions overview filtered to the current asset, allowing
 * operators to review pending, upcoming, and completed on-chain actions
 * that target the token contract.
 */
function RouteComponent() {
  const { asset } = useTokenLoaderQuery();
  const targetAddress = getEthereumAddress(asset.id);

  return (
    <ActionsOverview
      input={{ target: targetAddress }}
      tableIdPrefix={`asset-${targetAddress.toLowerCase()}`}
    />
  );
}
