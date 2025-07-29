import { AreaChartComponent } from "@/components/charts/area-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export interface TokenTotalSupplyAreaChartProps {
  assetId: string;
  timeRange?: number; // days, default 30
  showCollateral?: boolean; // for stablecoin/tokenizeddeposit
}

/**
 * Token Total Supply Area Chart Component
 *
 * Displays historical total supply data for a specific asset using an area chart.
 * Supports optional collateral display for stablecoin and tokenized deposit assets.
 */
export function TokenTotalSupplyAreaChart({
  assetId,
  timeRange = 30,
  showCollateral = false,
}: TokenTotalSupplyAreaChartProps) {
  const { t } = useTranslation("stats");

  // Fetch and transform total supply history data with select function
  // This reduces re-renders when other parts of the API response change
  const {
    data: { chartData, chartConfig, dataKeys },
  } = useSuspenseQuery({
    ...orpc.token.statsAssetTotalSupply.queryOptions({
      input: { assetId, days: timeRange },
    }),
    select: (response) => {
      // Transform the response data to chart format
      const transformedData = response.totalSupplyHistory.map((item) => ({
        timestamp: format(new Date(item.timestamp * 1000), "MMM dd"),
        totalSupply: Number.parseFloat(item.totalSupply),
        ...(item.totalCollateral &&
          showCollateral && {
            totalCollateral: Number.parseFloat(item.totalCollateral),
          }),
      }));

      // Configure chart colors and labels
      const config: ChartConfig = {
        totalSupply: {
          label: t("charts.totalSupply.label"),
          color: "var(--chart-1)",
        },
      };

      // Add collateral configuration if needed
      const keys = ["totalSupply"];
      if (
        showCollateral &&
        response.totalSupplyHistory.some((item) => item.totalCollateral)
      ) {
        config.totalCollateral = {
          label: t("charts.totalCollateral.label"),
          color: "var(--chart-2)",
        };
        keys.push("totalCollateral");
      }

      return {
        chartData: transformedData,
        chartConfig: config,
        dataKeys: keys,
      };
    },
  });

  return (
    <ComponentErrorBoundary componentName="Token Total Supply Chart">
      <AreaChartComponent
        title={t("charts.totalSupply.title")}
        description={t("charts.totalSupply.description")}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="timestamp"
        showLegend={dataKeys.length > 1}
        stacked={false}
      />
    </ComponentErrorBoundary>
  );
}
