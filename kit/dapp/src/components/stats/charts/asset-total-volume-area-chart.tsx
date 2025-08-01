import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { safeToNumber } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetTotalVolumeAreaChartProps {
  assetAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Asset Total Volume Area Chart Component
 *
 * Displays historical total volume data for a specific asset using an area chart.
 * Shows cumulative transaction volume over time to visualize trading activity trends.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function AssetTotalVolumeAreaChart({
  assetAddress,
  timeRange = 30,
}: AssetTotalVolumeAreaChartProps) {
  const { t } = useTranslation("stats");

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        volumeHistory?: Array<{ timestamp: number; totalVolume: string }>;
      }) => {
        // Handle empty data case
        if (!response.volumeHistory?.length) {
          return {
            chartData: [],
            chartConfig: {
              totalVolume: {
                label: t("charts.totalVolume.label"),
                color: "var(--chart-1)",
              },
            },
            dataKeys: ["totalVolume"],
          };
        }

        // Transform the response data to chart format using safe conversion
        const transformedData = response.volumeHistory.map((item) => ({
          timestamp: format(new Date(item.timestamp * 1000), "MMM dd"),
          totalVolume: safeToNumber(item.totalVolume),
        }));

        // Configure chart colors and labels
        const config: ChartConfig = {
          totalVolume: {
            label: t("charts.totalVolume.label"),
            color: "var(--chart-1)",
          },
        };

        return {
          chartData: transformedData,
          chartConfig: config,
          dataKeys: ["totalVolume"],
        };
      },
    [t]
  );

  // Fetch and transform total volume history data with optimized caching
  const {
    data: { chartData, chartConfig, dataKeys },
  } = useSuspenseQuery(
    orpc.token.statsVolume.queryOptions({
      input: { tokenAddress: assetAddress, days: timeRange },
      select: selectTransform,
      ...CHART_QUERY_OPTIONS,
    })
  );

  return (
    <ComponentErrorBoundary componentName="Asset Total Volume Chart">
      <AreaChartComponent
        title={t("charts.totalVolume.title")}
        description={t("charts.totalVolume.description", { days: timeRange })}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={false}
        stacked={false}
        yTickFormatter={(value: string) => {
          // Format Y-axis ticks with compact notation for better readability
          const numValue = Number(value);
          return new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(numValue);
        }}
      />
    </ComponentErrorBoundary>
  );
}
