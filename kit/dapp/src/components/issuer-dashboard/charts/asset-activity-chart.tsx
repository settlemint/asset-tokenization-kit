import { BarChartComponent } from "@/components/charts/bar-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
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
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes asset activity data from API
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Transform asset activity data to chart format
  const chartData = (metrics.assetActivity ?? [])
    .filter(
      (activity) =>
        activity.mintEventCount > 0 ||
        activity.transferEventCount > 0 ||
        activity.burnEventCount > 0 ||
        activity.clawbackEventCount > 0
    ) // Only show asset types with activity
    .map((activity) => ({
      assetType: activity.assetType,
      mint: activity.mintEventCount,
      transfer: activity.transferEventCount,
      burn: activity.burnEventCount,
      clawback: activity.clawbackEventCount,
    }));

  return (
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
  );
}
