import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/token/$id")({
  loader: async ({ context, params }) => {
    // Ensure factory data is loaded
    const factory = await context.queryClient.ensureQueryData(
      orpc.token.factoryRead.queryOptions({ input: { id: params.id } })
    );

    // TODO: When token.list supports filtering by factory, prefetch tokens for this specific factory
    // Currently the API doesn't support this, so we'll need to fetch all tokens and filter client-side

    return { factory };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { id } = Route.useParams();

  return (
    <div>
      <h1>Token Factory: {factory.name}</h1>
      <p>ID: {id}</p>
      <p>Type: {factory.typeId}</p>
      <pre>{JSON.stringify(factory, null, 2)}</pre>
    </div>
  );
}
