import { BarChartComponent } from "@/components/charts/bar-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  mint: {
    label: "Mint",
    color: "var(--chart-1)",
  },
  transfer: {
    label: "Transfer",
    color: "var(--chart-2)",
  },
  burn: {
    label: "Burn",
    color: "var(--chart-3)",
  },
  clawback: {
    label: "Clawback",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const dataKeys = ["mint", "transfer", "burn", "clawback"];

/**
 * Asset Activity Chart Component
 *
 * Displays the distribution of events by asset type in a bar chart format.
 * Shows different event types (mint, transfer, burn, clawback) for asset types with activity.
 */
export function AssetActivityChart() {
  const { t } = useTranslation("stats");

  // Fetch just the activity by asset data - more efficient
  const { data: metrics } = useSuspenseQuery(
    orpc.token.statsActivityByAsset.queryOptions({ input: {} })
  );

  // Transform asset activity data to chart format
  const chartData = metrics.assetActivity
    .filter(
      (activity) =>
        activity.mint > 0 ||
        activity.transfer > 0 ||
        activity.burn > 0 ||
        activity.clawback > 0
    ) // Only show asset types with activity
    .map((activity) => ({
      assetType: activity.assetType,
      mint: activity.mint,
      transfer: activity.transfer,
      burn: activity.burn,
      clawback: activity.clawback,
    }));

  return (
    <ComponentErrorBoundary componentName="Asset Activity Chart">
      <BarChartComponent
        title={t("charts.assetActivity.title")}
        description={t("charts.assetActivity.description")}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="assetType"
        showYAxis={false}
        showLegend={true}
      />
    </ComponentErrorBoundary>
  );
}
