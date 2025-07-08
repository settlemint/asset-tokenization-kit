import { AreaChartComponent } from "@/components/charts/area-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  users: {
    label: "Registered Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dataKeys = ["users"] as const;

/**
 * User Growth Chart Component
 *
 * Displays registered users in an area chart format.
 * Shows user growth over time using real API data.
 */
export function UserGrowthChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes user growth data from API
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Transform user growth data for chart display
  const chartData = (metrics.userGrowth ?? []).map((dataPoint) => ({
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
