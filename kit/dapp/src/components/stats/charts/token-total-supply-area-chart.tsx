import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export interface TokenTotalSupplyAreaChartProps {
  tokenAddress: string;
  timeRange?: number; // days, default 30
}

/**
 * Token Total Supply Area Chart Component
 *
 * Displays historical total supply data for a specific token using an area chart.
 */
export function TokenTotalSupplyAreaChart({
  tokenAddress,
  timeRange = 30,
}: TokenTotalSupplyAreaChartProps) {
  const { t } = useTranslation("stats");

  // Fetch and transform total supply history data with select function
  // This reduces re-renders when other parts of the API response change
  const {
    data: { chartData, chartConfig, dataKeys },
  } = useSuspenseQuery({
    ...orpc.token.statsAssetTotalSupply.queryOptions({
      input: { tokenAddress, days: timeRange },
    }),
    select: (response) => {
      // Transform the response data to chart format
      const transformedData = response.totalSupplyHistory.map((item) => ({
        timestamp: format(new Date(item.timestamp * 1000), "MMM dd"),
        totalSupply: Number.parseFloat(item.totalSupply),
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
      };
    },
  });

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
      />
    </ComponentErrorBoundary>
  );
}
