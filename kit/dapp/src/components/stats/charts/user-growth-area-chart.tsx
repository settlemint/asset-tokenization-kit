import { AreaChartComponent } from "@/components/charts/area-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const chartConfig = {
  users: {
    label: "Registered Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dataKeys = ["users"];

/**
 * User Growth Chart Component
 *
 * Displays registered users in an area chart format.
 * Shows user growth over time using real API data.
 */
export const UserGrowthAreaChart = withErrorBoundary(
  function UserGrowthAreaChart() {
    const { t } = useTranslation("stats");

    // Fetch user growth data
    const { data: metrics } = useSuspenseQuery(
      orpc.user.statsGrowthOverTime.queryOptions({
        input: { timeRange: 30 }, // 30 days of data
      })
    );

    // Transform the data for the chart
    const chartData = useMemo(() => {
      return metrics.userGrowth.map((dataPoint) => ({
        timestamp: dataPoint.timestamp,
        users: dataPoint.users,
      }));
    }, [metrics.userGrowth]);

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
);
