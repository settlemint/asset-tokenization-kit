import { orpc } from "@/orpc";
import * as m from "@/paraglide/messages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/private/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      orpc.system.list.queryOptions({ input: {} })
    );
  },
  component: Home,
});

function Home() {
  // const usersQuery = useSuspenseQuery(
  //   orpc.system.list.queryOptions({ input: {} })
  // );

  return (
    <div className="p-2">
      <h3>{m.example_message({ username: "John Doe" })}</h3>
      {/* <pre>{JSON.stringify(usersQuery.data, null, 2)}</pre> */}
    </div>
  );
}
