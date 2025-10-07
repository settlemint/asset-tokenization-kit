import { PieChartComponent } from "@/components/charts/pie-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const chartConfig = {
  bond: { label: "Bonds", color: "var(--chart-1)" },
  equity: { label: "Equity", color: "var(--chart-3)" },
  fund: { label: "Funds", color: "var(--chart-4)" },
  stablecoin: { label: "Stablecoins", color: "var(--chart-5)" },
  deposit: { label: "Deposits", color: "var(--chart-6)" },
} satisfies ChartConfig;

/**
 * Asset Value Distribution Chart Component
 *
 * Displays the distribution of total value across different asset types
 * using a pie chart visualization based on real API data.
 */
export function AssetValuePieChart() {
  const { t } = useTranslation("stats");

  // Fetch value distribution data
  const { data: metrics } = useSuspenseQuery(
    orpc.system.stats.assets.queryOptions({
      input: {},
    })
  );

  // Convert value breakdown to chart data format
  const chartData = useMemo(() => {
    return Object.entries(metrics.valueBreakdown).map(([assetType, value]) => ({
      assetType,
      totalValue: parseFloat(value),
    }));
  }, [metrics.valueBreakdown]);

  // Only include config for asset types that have data
  const activeChartConfig = useMemo(() => {
    return Object.fromEntries(
      Object.entries(chartConfig).filter(([key]) =>
        chartData.some((item) => item.assetType === key && item.totalValue > 0)
      )
    ) satisfies ChartConfig;
  }, [chartData]);

  return (
    <ComponentErrorBoundary componentName="Asset Value Distribution Chart">
      <PieChartComponent
        title={t("charts.assetValue.title")}
        description={t("charts.assetValue.description")}
        data={chartData}
        config={activeChartConfig}
        dataKey="totalValue"
        nameKey="assetType"
      />
    </ComponentErrorBoundary>
  );
}
