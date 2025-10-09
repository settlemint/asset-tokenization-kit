import { ASSET_COLORS } from "@/components/assets/asset-colors";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toNumber } from "dnum";
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
 * Asset Value Distribution Chart Component
 *
 * Displays the distribution of total value across different asset types
 * using a pie chart visualization based on real API data.
 */
export const AssetValuePieChart = withErrorBoundary(
  function AssetValuePieChart() {
    const { t } = useTranslation("stats");

    // Fetch value distribution data
    const { data: metrics } = useSuspenseQuery(
      orpc.system.stats.assets.queryOptions({
        input: {},
      })
    );

    // Convert value breakdown to chart data format
    const chartData = useMemo(() => {
      return Object.entries(metrics.valueBreakdown).map(
        ([assetType, value]) => ({
          assetType,
          totalValue: toNumber(value),
        })
      );
    }, [metrics.valueBreakdown]);

    // Only include config for asset types that have data
    const activeChartConfig = useMemo(() => {
      return Object.fromEntries(
        Object.entries(chartConfig).filter(([key]) =>
          chartData.some(
            (item) => item.assetType === key && item.totalValue > 0
          )
        )
      ) satisfies ChartConfig;
    }, [chartData]);

    return (
      <PieChartComponent
        title={t("charts.assetValue.title")}
        description={t("charts.assetValue.description")}
        data={chartData}
        config={activeChartConfig}
        dataKey="totalValue"
        nameKey="assetType"
      />
    );
  }
);
