import { getAssetTypeFromFactoryTypeId } from "@atk/zod/validators/asset-types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenBlocklistTable } from "@/components/tables/token-blocklist";
import { hasBlocklist } from "@/lib/utils/features-enabled";
import { orpc } from "@/orpc/orpc-client";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/blocklist"
)({
  loader: ({ context: { queryClient, orpc }, params: { tokenAddress } }) => {
    void queryClient.prefetchQuery(
      orpc.token.read.queryOptions({ input: { tokenAddress } })
    );
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { asset: loaderAsset, factory } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });

  // Keep data fresh so UI reacts to invalidations after mutations
  const { data: queriedAsset } = useQuery(
    orpc.token.read.queryOptions({ input: { tokenAddress: loaderAsset.id } })
  );

  const asset = queriedAsset ?? loaderAsset;
  const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);
  if (!hasBlocklist(assetType)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TokenBlocklistTable token={asset} />
    </div>
  );
}
