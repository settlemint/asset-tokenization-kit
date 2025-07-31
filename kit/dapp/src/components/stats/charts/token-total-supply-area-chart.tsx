import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { safeToNumber } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface TokenTotalSupplyAreaChartProps {
  tokenAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Token Total Supply Area Chart Component
 *
 * Displays historical total supply data for a specific token using an area chart.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function TokenTotalSupplyAreaChart({
  tokenAddress,
  timeRange = 30,
}: TokenTotalSupplyAreaChartProps) {
  const { t } = useTranslation("stats");

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        totalSupplyHistory?: Array<{ timestamp: number; totalSupply: string }>;
      }) => {
        // Handle empty data case
        if (!response.totalSupplyHistory?.length) {
          return {
            chartData: [],
            chartConfig: {
              totalSupply: {
                label: t("charts.totalSupply.label"),
                color: "var(--chart-1)",
              },
            },
            dataKeys: ["totalSupply"],
            isEmpty: true,
          };
        }

        // Transform the response data to chart format using safe conversion
        const transformedData = response.totalSupplyHistory.map((item) => ({
          timestamp: format(new Date(item.timestamp * 1000), "MMM dd"),
          totalSupply: safeToNumber(item.totalSupply),
        }));

        // Configure chart colors and labels
        const config: ChartConfig = {
          totalSupply: {
            label: t("charts.totalSupply.label"),
            color: "var(--chart-1)",
          },
        };

        return {
          chartData: transformedData,
          chartConfig: config,
          dataKeys: ["totalSupply"],
          isEmpty: false,
        };
      },
    [t]
  );

  // Fetch and transform total supply history data with optimized caching
  const {
    data: { chartData, chartConfig, dataKeys, isEmpty },
  } = useSuspenseQuery(
    orpc.token.statsTotalSupply.queryOptions({
      input: { tokenAddress, days: timeRange },
      select: selectTransform,
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
    })
  );

  // Handle empty state
  if (isEmpty) {
    return (
      <ComponentErrorBoundary componentName="Token Total Supply Chart">
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("charts.totalSupply.noData")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("charts.totalSupply.noDataDescription", { days: timeRange })}
            </p>
          </div>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Token Total Supply Chart">
      <AreaChartComponent
        title={t("charts.totalSupply.title")}
        description={t("charts.totalSupply.description", { days: timeRange })}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={false}
        stacked={false}
        tickFormatter={(value) => {
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
