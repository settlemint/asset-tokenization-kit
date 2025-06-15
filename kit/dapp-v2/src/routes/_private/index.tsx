import { useTranslation } from "@/lib/i18n";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/")({
  loader: ({ context }) => {
    // loads data while the page is loading, can take longer
    // Use with useSuspenseQuery, component calling useSuspenseQuery wrapped in <Suspense> if non priority info like graph data
    void context.queryClient.prefetchQuery(
      orpc.system.list.queryOptions({ input: {} })
    );

    // loads data before the page is rendered
    // await context.queryClient.ensureQueryData(
    //   orpc.system.list.queryOptions({ input: {} })
    // );

    // return await something // available in the component via Route.useLoaderData()
    // return promise // also available, use the <Suspense><Await></Suspense> component to use it from @tanstack/react-router
  },
  component: Home,
});

function Home() {
  const { t } = useTranslation();
  const usersQuery = useSuspenseQuery(
    orpc.system.list.queryOptions({ input: {} })
  );

  return (
    <div className="p-2">
      <h3>{t("example_message", { username: "John Doe" })}</h3>
      <pre>{JSON.stringify(usersQuery.data, null, 2)}</pre>
    </div>
  );
}
