import { BarChartComponent } from "@/components/charts/bar-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  totalAssets: {
    label: "Total assets",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dataKeys = ["totalAssets"];

/**
 * Asset Activity Chart Component
 *
 * Displays the distribution of assets by type in a bar chart format.
 * Shows the number of assets for each asset type (bonds, equity, funds, etc.)
 * based on the asset breakdown from the metrics summary.
 */
export function AssetActivityChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes asset breakdown
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Convert asset breakdown to chart data format
  const chartData = Object.entries(metrics.assetBreakdown)
    .filter(([, count]) => count > 0) // Only show asset types with assets
    .map(([type, count]) => ({
      assetType: type,
      totalAssets: count,
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
      showLegend={false}
    />
  );
}
