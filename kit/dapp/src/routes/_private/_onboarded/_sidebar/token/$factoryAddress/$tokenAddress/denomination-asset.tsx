import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { DenominationAssetTable } from "@/components/tables/denomination-assets";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/denomination-asset"
)({
  loader: ({ context: { queryClient, orpc }, params: { tokenAddress } }) => {
    // Prefetch token details to ensure snappy UX
    void queryClient.prefetchQuery(
      orpc.token.read.queryOptions({ input: { tokenAddress } })
    );
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["tokens", "common"]);
  const { asset } = useTokenLoaderQuery();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("tokens:tabs.denominationAsset")}
        </h2>
        <p className="text-muted-foreground">
          {t("tokens:descriptions.denominationAssetTab", {
            assetName: asset.name,
          })}
        </p>
      </div>

      <Suspense fallback={<DataTableSkeleton />}>
        <DenominationAssetTable tokenAddress={asset.id} />
      </Suspense>
    </div>
  );
}
