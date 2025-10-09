import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { safeToNumber } from "@/lib/utils/format-value/safe-to-number";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns/format";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetTotalSupplyAreaChartProps {
  assetAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Asset Total Supply Area Chart Component
 *
 * Displays historical total supply data for a specific asset using an area chart.
 * Uses dnum for safe BigInt handling to prevent precision loss.
 */
export function AssetTotalSupplyAreaChart({
  assetAddress,
  timeRange = 30,
}: AssetTotalSupplyAreaChartProps) {
  const { t } = useTranslation("stats");

  // Fetch total supply history data with optimized caching
  const { data } = useSuspenseQuery(
    orpc.token.statsTotalSupply.queryOptions({
      input: { tokenAddress: assetAddress, days: timeRange },
      ...CHART_QUERY_OPTIONS,
    })
  );

  // Transform the response data to chart format using safe conversion
  const chartData = useMemo(() => {
    if (!data.totalSupplyHistory?.length) {
      return [];
    }

    return data.totalSupplyHistory.map((item) => ({
      timestamp: format(new Date(item.timestamp / 1000), "MMM dd"),
      totalSupply: safeToNumber(item.totalSupply),
    }));
  }, [data.totalSupplyHistory]);

  // Configure chart colors and labels
  const chartConfig: ChartConfig = useMemo(
    () => ({
      totalSupply: {
        label: t("charts.totalSupply.label"),
        color: "var(--chart-1)",
      },
    }),
    [t]
  );

  const dataKeys = ["totalSupply"];

  return (
    <ComponentErrorBoundary componentName="Asset Total Supply Chart">
      <AreaChartComponent
        title={t("charts.totalSupply.title")}
        description={t("charts.totalSupply.description", { days: timeRange })}
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
