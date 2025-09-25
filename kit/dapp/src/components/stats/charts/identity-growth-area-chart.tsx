import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const chartConfig = {
  activeUserIdentitiesCount: {
    label: "Registered Identities",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dataKeys = ["activeUserIdentitiesCount"];

/**
 * Identity Growth Chart Component
 *
 * Displays identity statistics in an area chart format.
 * Shows registered, pending, and removed identities over time using real API data.
 */
export function IdentityGrowthAreaChart() {
  const { t } = useTranslation("dashboard");
  const now = new Date();

  // Fetch identity growth data
  const { data: metrics } = useQuery(
    orpc.system.stats.identityStatsOverTime.queryOptions({
      input: { fromTimestamp: subDays(now, 7), toTimestamp: now }, // 7 days of data
    })
  );

  // Transform the data for the chart
  const chartData = useMemo(() => {
    return metrics?.identityStats.map((dataPoint) => ({
      timestamp: dataPoint.timestamp,
      activeUserIdentitiesCount: dataPoint.activeUserIdentitiesCount,
    }));
  }, [metrics?.identityStats]);

  return (
    <ComponentErrorBoundary componentName="Identity Growth Chart">
      <AreaChartComponent
        title={t("identityMetrics.chartTitle")}
        description={t("identityMetrics.chartDescription")}
        data={chartData ?? []}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showYAxis={true}
        showLegend={true}
        emptyMessage={t("identityMetrics.emptyStateMessage")}
        emptyDescription={t("identityMetrics.emptyStateDescription")}
      />
    </ComponentErrorBoundary>
  );
}
