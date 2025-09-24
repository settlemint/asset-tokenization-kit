import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionSubtitle } from "@/components/dashboard/section-subtitle";
import { SectionTitle } from "@/components/dashboard/section-title";
import { AssetSupplyPieChart } from "@/components/stats/charts/asset-supply-pie-chart";
import { AssetStatsWidget } from "@/components/stats/widgets/asset-stats-widget";
import { ValueStatsWidget } from "@/components/stats/widgets/value-stats-widget";
import { WidgetSkeleton } from "@/components/stats/widgets/widget-skeleton";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

function AssetOverviewSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div>
          <ChartSkeleton />
        </div>
        <div className="flex flex-col gap-4">
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      </div>
    </div>
  );
}

function AssetOverviewSectionContent() {
  const { t } = useTranslation("dashboard");

  const { data: metrics } = useSuspenseQuery(
    orpc.system.stats.assets.queryOptions({ input: {} })
  );

  const hasAssets = metrics.totalAssets > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <SectionTitle>{t("assetOverview.title")}</SectionTitle>
        <SectionSubtitle>{t("assetOverview.subtitle")}</SectionSubtitle>
      </div>

      {hasAssets ? (
        <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <div>
            <Suspense fallback={<ChartSkeleton />}>
              <AssetSupplyPieChart />
            </Suspense>
          </div>
          <div className="flex flex-col gap-4">
            <Suspense fallback={<WidgetSkeleton />}>
              <AssetStatsWidget />
            </Suspense>

            <Suspense fallback={<WidgetSkeleton />}>
              <ValueStatsWidget />
            </Suspense>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title={t("assetOverview.emptyState.title")}
          description={t("assetOverview.emptyState.description")}
        />
      )}
    </div>
  );
}

export function AssetOverviewSection() {
  return (
    <Suspense fallback={<AssetOverviewSectionSkeleton />}>
      <AssetOverviewSectionContent />
    </Suspense>
  );
}
