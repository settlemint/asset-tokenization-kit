import { ActivityTable } from "@/components/activity/activity-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/activity")({
  loader: async ({ context: { queryClient, orpc } }) => {
    await queryClient.prefetchQuery(
      orpc.user.events.queryOptions({
        input: {
          limit: 20,
          offset: 0,
          orderBy: "blockTimestamp",
          orderDirection: "desc",
        },
      })
    );
  },
  component: Activity,
});

function Activity() {
  const { t } = useTranslation("activity");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <Suspense fallback={<DataTableSkeleton />}>
        <ActivityTable />
      </Suspense>
    </div>
  );
}
