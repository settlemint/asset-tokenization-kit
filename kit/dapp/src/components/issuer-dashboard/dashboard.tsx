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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* TODO: Add charts and tables */}
      {/* Charts Section */}
      {/* <div>
        <h2 className="text-2xl font-semibold mb-4">{t("stats.title")}</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
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
      </div> */}

      {/* Tables Section */}
      {/* <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">{t("tables.actions")}</h2>
          <Suspense fallback={<div>Loading actions...</div>}>
            <PendingActionsTable />
          </Suspense>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">{t("tables.latestEvents")}</h2>
          <Suspense fallback={<div>Loading events...</div>}>
            <LatestEventsTable />
          </Suspense>
        </div>
      </div> */}
    </div>
  );
}