import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { UserAssetsTable } from "@/components/users/user-assets";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/my-assets")(
  {
    loader: async ({ context: { queryClient, orpc } }) => {
      await queryClient.prefetchQuery(orpc.user.assets.queryOptions());
    },
    component: MyAssets,
  }
);

function MyAssets() {
  const { t } = useTranslation("user-assets");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <Suspense fallback={<DataTableSkeleton />}>
        <UserAssetsTable />
      </Suspense>
    </div>
  );
}
