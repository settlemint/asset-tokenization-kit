import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenBlocklistTable } from "@/components/tables/token-blocklist";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/blocklist"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { asset } = useTokenLoaderQuery();

  return (
    <div className="space-y-6">
      <TokenBlocklistTable token={asset} />
    </div>
  );
}
