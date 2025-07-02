import { DepositsTable } from "@/components/tables/deposits";
import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

import { createDataTableSearchParams } from "@/components/data-table/utils/data-table-url-state";

export const Route = createFileRoute(
  "/_private/_onboarded/token/$factoryAddress"
)({
  validateSearch: createDataTableSearchParams({ defaultPageSize: 20 }),
  loader: async ({ context, params }) => {
    // Ensure factory data is loaded
    const factory = await context.queryClient.ensureQueryData(
      orpc.token.factoryRead.queryOptions({
        input: { id: params.factoryAddress },
      })
    );

    void context.queryClient.prefetchQuery(
      orpc.token.list.queryOptions({
        input: {
          tokenFactory: params.factoryAddress,
        },
      })
    );

    return { factory };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { factoryAddress } = Route.useParams();

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{factory.name}</h1>
      </div>

      <DepositsTable factoryAddress={factoryAddress} />
    </div>
  );
}
