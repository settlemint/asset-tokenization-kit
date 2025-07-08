import { AreaChartComponent } from "@/components/charts/area-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  users: {
    label: "Total Users",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const dataKeys = ["users"] as const;

/**
 * User Growth Chart Component
 *
 * Displays user growth over time in an area chart format.
 * Shows cumulative user growth over the last 7 days using time series data.
 */
export function UserGrowthChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes user growth time series data
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Transform user growth data for chart display
  const chartData = metrics.userGrowth.map((dataPoint) => ({
    timestamp: dataPoint.timestamp,
    users: dataPoint.users,
  }));

  return (
    <AreaChartComponent
      title={t("charts.userGrowth.title")}
      description={t("charts.userGrowth.description")}
      data={chartData}
      config={chartConfig}
      dataKeys={dataKeys}
      nameKey="timestamp"
      showYAxis={true}
      showLegend={false}
    />
  );
}
