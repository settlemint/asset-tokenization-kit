import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/token/stats")({
  loader: async ({ context }) => {
    // Ensure all token factories are loaded for statistics overview
    const factories = await context.queryClient.ensureQueryData(
      orpc.token.factoryList.queryOptions({ input: {} })
    );

    // Prefetch the global token list once for potential use in statistics
    // Note: Currently token.list doesn't support filtering by factory
    void context.queryClient.prefetchQuery(
      orpc.token.list.queryOptions({
        input: {
          offset: 0,
          limit: 50,
        },
      })
    );

    return { factories };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { factories } = Route.useLoaderData();

  return (
    <div>
      <h1>Token Statistics</h1>
      <p>Total Factories: {factories.length}</p>
      <p>
        Factories with Tokens: {factories.filter((f) => f.hasTokens).length}
      </p>
      <pre>{JSON.stringify(factories, null, 2)}</pre>
    </div>
  );
}
