import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/my-assets")(
  {
    loader: async ({ context: { queryClient, orpc } }) => {
      const user = await queryClient.ensureQueryData(
        orpc.user.me.queryOptions()
      );
      await queryClient.prefetchQuery(orpc.user.assets.queryOptions());
      return { user };
    },
    component: MyAssets,
  }
);

function MyAssets() {
  const { user } = Route.useLoaderData();
  const { data: assets } = useQuery(orpc.user.assets.queryOptions());

  console.log(assets);

  return <div className="p-6 space-y-6">{user?.wallet}</div>;
}
