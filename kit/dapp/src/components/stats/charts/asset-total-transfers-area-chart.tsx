import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { safeToNumber } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetTotalTransfersAreaChartProps {
  assetAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Asset Total Transfers Area Chart Component
 *
 * Displays historical total transfers data for a specific asset using an area chart.
 * Shows cumulative transfer amounts over time to visualize activity trends.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function AssetTotalTransfersAreaChart({
  assetAddress,
  timeRange = 30,
}: AssetTotalTransfersAreaChartProps) {
  const { t } = useTranslation("stats");

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        transfersHistory?: Array<{ timestamp: number; totalTransferred: string }>;
      }) => {
        // Handle empty data case
        if (!response.transfersHistory?.length) {
          return {
            chartData: [],
            chartConfig: {
              totalTransferred: {
                label: t("charts.totalTransfers.label"),
                color: "var(--chart-1)",
              },
            },
            dataKeys: ["totalTransferred"],
          };
        }

        // Transform the response data to chart format using safe conversion
        const transformedData = response.transfersHistory.map((item) => ({
          timestamp: format(new Date(item.timestamp * 1000), "MMM dd"),
          totalTransferred: safeToNumber(item.totalTransferred),
        }));

        // Configure chart colors and labels
        const config: ChartConfig = {
          totalTransferred: {
            label: t("charts.totalTransfers.label"),
            color: "var(--chart-1)",
          },
        };

        return {
          chartData: transformedData,
          chartConfig: config,
          dataKeys: ["totalTransferred"],
        };
      },
    [t]
  );

  // Fetch and transform total transfers history data with optimized caching
  const {
    data: { chartData, chartConfig, dataKeys },
  } = useSuspenseQuery(
    orpc.token.statsTransfers.queryOptions({
      input: { tokenAddress: assetAddress, days: timeRange },
      select: selectTransform,
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
    })
  );

  return (
    <ComponentErrorBoundary componentName="Asset Total Transfers Chart">
      <AreaChartComponent
        title={t("charts.totalTransfers.title")}
        description={t("charts.totalTransfers.description", { days: timeRange })}
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