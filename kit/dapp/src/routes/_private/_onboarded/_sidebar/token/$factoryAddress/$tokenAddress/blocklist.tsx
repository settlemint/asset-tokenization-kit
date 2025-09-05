import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenBlocklistTable } from "@/components/tables/token-blocklist";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { hasBlocklist } from "@/lib/utils/features-enabled";
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/blocklist"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { asset } = useTokenLoaderQuery();
  const { factory } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });
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
