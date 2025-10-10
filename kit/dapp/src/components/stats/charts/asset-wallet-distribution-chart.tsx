import { BarChartComponent } from "@/components/charts/bar-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetWalletDistributionChartProps {
  assetAddress: string;
}

/**
 * Asset Wallet Distribution Chart Component
 *
 * Displays the distribution of token holders across different balance ranges
 * using a horizontal bar chart. The distribution is divided into 5 dynamic
 * buckets based on percentages of the maximum balance.
 */
export const AssetWalletDistributionChart = withErrorBoundary(
  function AssetWalletDistributionChart({
    assetAddress,
  }: AssetWalletDistributionChartProps) {
    const { t } = useTranslation("stats");

    // Fetch wallet distribution data with optimized caching
    const { data } = useSuspenseQuery(
      orpc.token.statsWalletDistribution.queryOptions({
        input: { tokenAddress: assetAddress },
        ...CHART_QUERY_OPTIONS,
      })
    );

    // Use the buckets data directly
    const chartData = useMemo(() => {
      if (!data.buckets?.length || data.totalHolders === 0) {
        return [];
      }
      return data.buckets;
    }, [data.buckets, data.totalHolders]);

    // Configure chart colors and labels
    const chartConfig: ChartConfig = useMemo(
      () => ({
        count: {
          label: t("charts.walletDistribution.holders"),
          color: "var(--chart-1)",
        },
      }),
      [t]
    );

    const dataKeys = ["count"];

    return (
      <BarChartComponent
        title={t("charts.walletDistribution.title")}
        description={t("charts.walletDistribution.description")}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="range"
        showYAxis={true}
        showLegend={false}
        stacked={false}
      />
    );
  }
);
