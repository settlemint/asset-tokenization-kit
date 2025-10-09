import { AreaChartComponent } from "@/components/charts/area-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { safeToNumber } from "@/lib/utils/format-value/safe-to-number";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetSupplyChangesAreaChartProps {
  assetAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Asset Supply Changes Area Chart Component
 *
 * Displays historical minted and burned asset data for a specific asset using an area chart.
 * Shows minted amounts as positive values and burned amounts as negative values.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export const AssetSupplyChangesAreaChart = withErrorBoundary(
  function AssetSupplyChangesAreaChart({
    assetAddress,
    timeRange = 30,
  }: AssetSupplyChangesAreaChartProps) {
    const { t } = useTranslation("stats");

    // Fetch supply changes history data with optimized caching
    const { data } = useSuspenseQuery(
      orpc.token.statsSupplyChanges.queryOptions({
        input: { tokenAddress: assetAddress, days: timeRange },
        ...CHART_QUERY_OPTIONS,
      })
    );

    // Transform the response data to chart format using safe conversion
    const chartData = useMemo(() => {
      if (!data.supplyChangesHistory?.length) {
        return [];
      }

      // Convert burned amounts to negative values for visualization
      return data.supplyChangesHistory.map((item) => ({
        timestamp: format(item.timestamp, "MMM dd"),
        totalMinted: safeToNumber(item.totalMinted),
        totalBurned: -safeToNumber(item.totalBurned), // Negative for burned amounts
      }));
    }, [data.supplyChangesHistory]);

    // Configure chart colors and labels
    const chartConfig: ChartConfig = useMemo(
      () => ({
        totalMinted: {
          label: t("charts.supplyChanges.minted"),
          color: "var(--chart-1)", // Green for minted
        },
        totalBurned: {
          label: t("charts.supplyChanges.burned"),
          color: "var(--chart-3)", // Red for burned
        },
      }),
      [t]
    );

    const dataKeys = ["totalMinted", "totalBurned"];

    return (
      <AreaChartComponent
        title={t("charts.supplyChanges.title")}
        description={t("charts.supplyChanges.description", { days: timeRange })}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={true} // Show legend for minted/burned
        stacked={false} // Don't stack, show as separate areas
        yTickFormatter={(value: string) => {
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
    );
  }
);
