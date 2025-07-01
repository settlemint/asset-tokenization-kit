import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/token/$factoryAddress"
)({
  loader: async ({ context, params }) => {
    // Ensure factory data is loaded
    const factory = await context.queryClient.ensureQueryData(
      orpc.token.factoryRead.queryOptions({
        input: { id: params.factoryAddress },
      })
    );

    // TODO: When token.list supports filtering by factory, prefetch tokens for this specific factory
    // Currently the API doesn't support this, so we'll need to fetch all tokens and filter client-side

    return { factory };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { factoryAddress } = Route.useParams();

  return (
    <div>
      <h1>Token Factory: {factory.name}</h1>
      <p>Factory Address: {factoryAddress}</p>
      <p>Type ID: {factory.typeId}</p>
      <pre>{JSON.stringify(factory, null, 2)}</pre>
    </div>
  );
}
