import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { AssetActivityChart } from "@/components/stats/charts/asset-activity-chart";
import { AssetSupplyChart } from "@/components/stats/charts/asset-supply-chart";
import { ChartSkeleton } from "@/components/stats/charts/chart-skeleton";
import { TransactionHistoryChart } from "@/components/stats/charts/transaction-history-chart";
import { UserGrowthChart } from "@/components/stats/charts/user-growth-chart";
import { AssetStatsWidget } from "@/components/stats/widgets/asset-stats-widget";
import { TransactionStatsWidget } from "@/components/stats/widgets/transaction-stats-widget";
import { UserStatsWidget } from "@/components/stats/widgets/user-stats-widget";
import { ValueStatsWidget } from "@/components/stats/widgets/value-stats-widget";
import { WidgetSkeleton } from "@/components/stats/widgets/widget-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/stats"
)({
  loader: async ({ context: { queryClient, orpc } }) => {
    // Ensure all token factories are loaded for statistics overview
    const factories = await queryClient.ensureQueryData(
      orpc.token.factoryList.queryOptions({ input: {} })
    );

    // Get tokens from the first factory for demonstration
    if (factories.length > 0 && factories[0]) {
      void queryClient.prefetchQuery(
        orpc.token.list.queryOptions({
          input: {
            tokenFactory: factories[0].id,
            offset: 0,
            limit: 50,
          },
        })
      );
    }

    return { factories };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation("stats");

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      {/* Widgets Section */}
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <Suspense fallback={<WidgetSkeleton />}>
          <AssetStatsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <TransactionStatsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <UserStatsWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <ValueStatsWidget />
        </Suspense>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0 2xl:grid-cols-4">
        <Suspense fallback={<ChartSkeleton />}>
          <AssetSupplyChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <AssetActivityChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <UserGrowthChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TransactionHistoryChart />
        </Suspense>
      </div>
    </div>
  );
}
