import { PieChartComponent } from "@/components/charts/pie-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetCollateralRatioChartProps {
  assetAddress: string;
}

/**
 * Asset Collateral Ratio Chart Component
 *
 * Displays the collateral ratio for stablecoins and tokenized deposits
 * using a pie chart. Shows the breakdown between available and used collateral.
 * Only renders for assets that have collateral data.
 */
export function AssetCollateralRatioChart({
  assetAddress,
}: AssetCollateralRatioChartProps) {
  const { t } = useTranslation("stats");

  // Memoize the data transformation function to prevent unnecessary re-creation
  const selectTransform = useMemo(
    () =>
      (response: {
        buckets: Array<{ name: string; value: number }>;
        totalCollateral: number;
        collateralRatio: number;
      }) => {
        // Handle empty data case
        if (!response.buckets?.length || response.totalCollateral === 0) {
          return {
            chartData: [],
            chartConfig: {
              collateralAvailable: {
                label: t("charts.collateralRatio.available"),
                color: "var(--chart-1)",
              },
              collateralUsed: {
                label: t("charts.collateralRatio.used"),
                color: "var(--chart-2)",
              },
            },
            totalCollateral: 0,
            collateralRatio: 0,
          };
        }

        // Configure chart colors and labels
        const config: ChartConfig = {
          collateralAvailable: {
            label: t("charts.collateralRatio.available"),
            color: "var(--chart-1)",
          },
          collateralUsed: {
            label: t("charts.collateralRatio.used"),
            color: "var(--chart-2)",
          },
        };

        return {
          chartData: response.buckets,
          chartConfig: config,
          totalCollateral: response.totalCollateral,
          collateralRatio: response.collateralRatio,
        };
      },
    [t]
  );

  // Fetch and transform collateral ratio data with optimized caching
  const {
    data: { chartData, chartConfig, totalCollateral, collateralRatio },
  } = useSuspenseQuery(
    orpc.token.statsCollateralRatio.queryOptions({
      input: { tokenAddress: assetAddress },
      select: selectTransform,
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
    })
  );

  // Don't render if no collateral data
  if (totalCollateral === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Asset Collateral Ratio Chart">
      <PieChartComponent
        title={t("charts.collateralRatio.title")}
        description={t("charts.collateralRatio.description")}
        data={chartData}
        config={chartConfig}
        dataKey="value"
        nameKey="name"
        footer={
          <div className="text-sm text-muted-foreground">
            {t("charts.collateralRatio.ratio", {
              ratio: collateralRatio.toFixed(1),
            })}
          </div>
        }
      />
    </ComponentErrorBoundary>
  );
}