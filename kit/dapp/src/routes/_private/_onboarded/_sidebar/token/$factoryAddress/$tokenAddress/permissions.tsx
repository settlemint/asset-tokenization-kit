import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { TokenPermissionsTable } from "@/components/tables/token-permissions";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/permissions"
)({
  loader: ({ context: { queryClient, orpc }, params: { tokenAddress } }) => {
    // Prefetch token details to ensure snappy UX
    void queryClient.prefetchQuery(
      orpc.token.read.queryOptions({ input: { tokenAddress } })
    );
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  // no-op: this route renders a table; no local i18n usage
  const { asset: loaderAsset } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });

  // Subscribe to live token to reflect invalidations after mutations
  const { data: queriedAsset } = useQuery(
    orpc.token.read.queryOptions({ input: { tokenAddress: loaderAsset.id } })
  );

  const asset = queriedAsset ?? loaderAsset;
  return (
    <div className="space-y-6">
      <TokenPermissionsTable token={asset} />
    </div>
  );
}
