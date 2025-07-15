import { PieChartComponent } from "@/components/charts/pie-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  bond: { label: "Bonds", color: "var(--chart-1)" },
  equity: { label: "Equity", color: "var(--chart-3)" },
  fund: { label: "Funds", color: "var(--chart-4)" },
  stablecoin: { label: "Stablecoins", color: "var(--chart-5)" },
  deposit: { label: "Deposits", color: "var(--chart-6)" },
} satisfies ChartConfig;

/**
 * Asset Supply Chart Component
 *
 * Displays the distribution of total supply across different asset types
 * using a pie chart visualization based on real API data.
 */
export function AssetSupplyChart() {
  const { t } = useTranslation("stats");

  // Fetch just the supply distribution data - more efficient
  const { data: metrics } = useSuspenseQuery(
    orpc.token.statsSupplyDistribution.queryOptions({ input: {} })
  );

  // Convert supply distribution to chart data format
  const chartData = metrics.supplyDistribution.map((item) => ({
    assetType: item.assetType,
    totalSupply: Number(item.totalSupply),
  }));

  // Only include config for asset types that have data
  const activeChartConfig = Object.fromEntries(
    Object.entries(chartConfig).filter(([key]) =>
      chartData.some((item) => item.assetType === key)
    )
  ) satisfies ChartConfig;

  return (
    <ComponentErrorBoundary componentName="Asset Supply Chart">
      <PieChartComponent
        title={t("charts.assetSupply.title")}
        description={t("charts.assetSupply.description")}
        data={chartData}
        config={activeChartConfig}
        dataKey="totalSupply"
        nameKey="assetType"
      />
    </ComponentErrorBoundary>
  );
}
