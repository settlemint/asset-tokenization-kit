import { BarChartComponent } from "@/components/charts/bar-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
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
export function AssetWalletDistributionChart({
  assetAddress,
}: AssetWalletDistributionChartProps) {
  const { t } = useTranslation("stats");

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        buckets: Array<{ range: string; count: number }>;
        totalHolders: number;
      }) => {
        // Handle empty data case
        if (!response.buckets?.length || response.totalHolders === 0) {
          return {
            chartData: [],
            chartConfig: {
              count: {
                label: t("charts.walletDistribution.holders"),
                color: "var(--chart-1)",
              },
            },
            dataKeys: ["count"],
            totalHolders: 0,
          };
        }

        // Configure chart colors and labels
        const config: ChartConfig = {
          count: {
            label: t("charts.walletDistribution.holders"),
            color: "var(--chart-1)",
          },
        };

        return {
          chartData: response.buckets,
          chartConfig: config,
          dataKeys: ["count"],
          totalHolders: response.totalHolders,
        };
      },
    [t]
  );

  // Fetch and transform wallet distribution data with optimized caching
  const {
    data: { chartData, chartConfig, dataKeys },
  } = useSuspenseQuery(
    orpc.token.statsWalletDistribution.queryOptions({
      input: { tokenAddress: assetAddress },
      select: selectTransform,
      ...CHART_QUERY_OPTIONS,
    })
  );

  return (
    <ComponentErrorBoundary componentName="Asset Wallet Distribution Chart">
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
    </ComponentErrorBoundary>
  );
}
