import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { createFileRoute } from "@tanstack/react-router";
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
  const { asset } = useTokenLoaderQuery();
  return (
    <div className="space-y-6">
      <TokenPermissionsTable token={asset} />
    </div>
  );
}
