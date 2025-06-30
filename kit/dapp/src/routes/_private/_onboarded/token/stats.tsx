import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/token/stats")({
  loader: async ({ context }) => {
    // Prefetch all token factories for statistics overview
    const factories = await context.queryClient.ensureQueryData(
      orpc.token.factoryList.queryOptions({ input: {} })
    );

    // Prefetch token lists for each factory that has tokens
    const factoriesWithTokens = factories.filter((f) => f.hasTokens);

    // Batch prefetch token lists for better performance
    await Promise.all(
      factoriesWithTokens.slice(0, 5).map(async () =>
        context.queryClient.prefetchQuery(
          orpc.token.list.queryOptions({
            input: {
              offset: 0,
              limit: 10,
            },
          })
        )
      )
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
