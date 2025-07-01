import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/token/$type")({
  loader: async ({ context, params }) => {
    // Ensure factory data is loaded
    const factory = await context.queryClient.ensureQueryData(
      orpc.token.factoryRead.queryOptions({ input: { id: params.type } })
    );

    // TODO: When token.list supports filtering by factory, prefetch tokens for this specific factory
    // Currently the API doesn't support this, so we'll need to fetch all tokens and filter client-side

    return { factory };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { type } = Route.useParams();

  return (
    <div>
      <h1>Token Factory: {factory.name}</h1>
      <p>Type: {type}</p>
      <p>Type ID: {factory.typeId}</p>
      <pre>{JSON.stringify(factory, null, 2)}</pre>
    </div>
  );
}
