import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { safeToNumber } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface TokenSupplyChangesAreaChartProps {
  tokenAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Token Supply Changes Area Chart Component
 *
 * Displays historical minted and burned token data for a specific token using an area chart.
 * Shows minted amounts as positive values and burned amounts as negative values.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function TokenSupplyChangesAreaChart({
  tokenAddress,
  timeRange = 30,
}: TokenSupplyChangesAreaChartProps) {
  const { t } = useTranslation("stats");

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        supplyChangesHistory?: Array<{
          timestamp: number;
          totalMinted: string;
          totalBurned: string;
        }>;
      }) => {
        // Handle empty data case
        if (!response.supplyChangesHistory?.length) {
          return {
            chartData: [],
            chartConfig: {
              totalMinted: {
                label: t("charts.supplyChanges.minted"),
                color: "var(--chart-1)", // Green for minted
              },
              totalBurned: {
                label: t("charts.supplyChanges.burned"),
                color: "var(--chart-3)", // Red for burned
              },
            },
            dataKeys: ["totalMinted", "totalBurned"],
            isEmpty: true,
          };
        }

        // Transform the response data to chart format using safe conversion
        // Convert burned amounts to negative values for visualization
        const transformedData = response.supplyChangesHistory.map((item) => ({
          timestamp: format(new Date(item.timestamp * 1000), "MMM dd"),
          totalMinted: safeToNumber(item.totalMinted),
          totalBurned: -safeToNumber(item.totalBurned), // Negative for burned amounts
        }));

        // Configure chart colors and labels
        const config: ChartConfig = {
          totalMinted: {
            label: t("charts.supplyChanges.minted"),
            color: "var(--chart-1)", // Green for minted
          },
          totalBurned: {
            label: t("charts.supplyChanges.burned"),
            color: "var(--chart-3)", // Red for burned
          },
        };

        return {
          chartData: transformedData,
          chartConfig: config,
          dataKeys: ["totalMinted", "totalBurned"],
          isEmpty: false,
        };
      },
    [t]
  );

  // Fetch and transform supply changes history data with optimized caching
  const {
    data: { chartData, chartConfig, dataKeys, isEmpty },
  } = useSuspenseQuery({
    ...orpc.token.statsSupplyChanges.queryOptions({
      input: { tokenAddress, days: timeRange },
    }),
    select: selectTransform,
    staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
  });

  // Handle empty state
  if (isEmpty) {
    return (
      <ComponentErrorBoundary componentName="Token Supply Changes Chart">
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("charts.supplyChanges.noData")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("charts.supplyChanges.noDataDescription", { days: timeRange })}
            </p>
          </div>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Token Supply Changes Chart">
      <AreaChartComponent
        title={t("charts.supplyChanges.title")}
        description={t("charts.supplyChanges.description", { days: timeRange })}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={true} // Show legend for minted/burned
        stacked={false} // Don't stack, show as separate areas
        tickFormatter={(value) => {
          // Format Y-axis ticks with compact notation and handle negative values
          const numValue = Number(value);
          const isNegative = numValue < 0;
          const absValue = Math.abs(numValue);

          const formatted = new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(absValue);

          return isNegative ? `-${formatted}` : formatted;
        }}
      />
    </ComponentErrorBoundary>
  );
}
