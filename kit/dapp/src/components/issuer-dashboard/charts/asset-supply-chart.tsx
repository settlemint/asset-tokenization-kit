import { PieChartComponent } from "@/components/charts/pie-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  bond: { label: "Bonds", color: "hsl(var(--chart-1))" },
  equity: { label: "Equity", color: "hsl(var(--chart-2))" },
  fund: { label: "Funds", color: "hsl(var(--chart-3))" },
  stablecoin: { label: "Stablecoins", color: "hsl(var(--chart-4))" },
  deposit: { label: "Deposits", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

/**
 * Asset Supply Chart Component
 *
 * Displays the distribution of different asset types across the platform
 * using a pie chart visualization based on actual token statistics.
 */
export function AssetSupplyChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes asset breakdown from token stats
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Convert asset breakdown to chart data format
  const chartData = Object.entries(metrics.assetBreakdown)
    .filter(([, count]) => count > 0) // Only show asset types that exist
    .map(([type, count]) => ({
      assetType: type,
      count,
    }));

  return (
    <PieChartComponent
      title={t("charts.assetSupply.title")}
      description={t("charts.assetSupply.description")}
      data={chartData}
      config={chartConfig}
      dataKey="count"
      nameKey="assetType"
      showLegend={true}
    />
  );
}
