import { ASSET_COLORS } from "@/components/assets/asset-colors";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const chartConfig = {
  bond: { label: "Bonds", color: ASSET_COLORS.bond },
  equity: { label: "Equity", color: ASSET_COLORS.equity },
  fund: { label: "Funds", color: ASSET_COLORS.fund },
  stablecoin: { label: "Stablecoins", color: ASSET_COLORS.stablecoin },
  deposit: { label: "Deposits", color: ASSET_COLORS.deposit },
} satisfies ChartConfig;

/**
 * Asset Supply Chart Component
 *
 * Displays the distribution of total supply across different asset types
 * using a pie chart visualization based on real API data.
 */
export function AssetSupplyPieChart() {
  const { t } = useTranslation("stats");

  // Fetch supply distribution data
  const { data: metrics } = useSuspenseQuery(
    orpc.system.stats.assets.queryOptions({
      input: {},
    })
  );

  // Convert asset breakdown to chart data format
  const chartData = useMemo(() => {
    return Object.entries(metrics.assetBreakdown).map(([assetType, count]) => ({
      assetType,
      totalSupply: count,
    }));
  }, [metrics.assetBreakdown]);

  // Only include config for asset types that have data
  const activeChartConfig = useMemo(() => {
    return Object.fromEntries(
      Object.entries(chartConfig).filter(([key]) =>
        chartData.some((item) => item.assetType === key)
      )
    ) satisfies ChartConfig;
  }, [chartData]);

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
