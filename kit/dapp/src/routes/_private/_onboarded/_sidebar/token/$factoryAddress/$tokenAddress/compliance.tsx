import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/compliance"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { asset } = useTokenLoaderQuery();

  const { data: compliance } = useSuspenseQuery(
    orpc.token.compliance.queryOptions({
      input: { tokenAddress: asset.id },
    })
  );

  return (
    <div className="space-y-6">
      <pre>{JSON.stringify(compliance, undefined, 2)}</pre>
    </div>
  );
}
