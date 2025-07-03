import { PageHeader } from "@/components/layout/page-header";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AssetStatsWidget } from "./widgets/asset-stats-widget";
import { TransactionStatsWidget } from "./widgets/transaction-stats-widget";
import { UserStatsWidget } from "./widgets/user-stats-widget";
import { ValueStatsWidget } from "./widgets/value-stats-widget";
import { WidgetSkeleton } from "./widgets/widget-skeleton";

/**
 * Main Dashboard component that displays platform statistics, charts, and tables.
 *
 * This component serves as the container for the entire dashboard experience,
 * organizing widgets, charts, and data tables in a responsive grid layout.
 * Uses Suspense boundaries for granular loading states.
 */
export function Dashboard() {
  const { t } = useTranslation("issuer-dashboard");

  return (
    <>
      <PageHeader title={t("title")} section={t("asset-management")} />
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
      {/* <p className="mt-8 mb-4 font-semibold text-2xl">{t("stats-heading")}</p>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0 2xl:grid-cols-4">
        {/* Charts Section */}
        {/* <Suspense fallback={<ChartSkeleton />}>
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
        </Suspense>  */}
      {/* </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">{t("actions-heading")}</p>
      <ActionsTable status="PENDING" type="Admin" />
      <p className="mt-8 mb-4 font-semibold text-2xl">
        {t("latest-events-heading")}
      </p> */}
      {/* <LatestEvents /> */}
    </>
  );
}