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
 * Displays the distribution of total supply across different asset types
 * using a pie chart visualization based on actual token statistics.
 */
export function AssetSupplyChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes asset supply breakdown from token stats
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Convert asset supply breakdown to chart data format
  const chartData = Object.entries(metrics.assetSupplyBreakdown)
    .filter(([, supply]) => parseFloat(supply) > 0) // Only show asset types with supply
    .map(([type, supply]) => ({
      assetType: type,
      totalSupply: parseFloat(supply),
    }));

  return (
    <PieChartComponent
      title={t("charts.assetSupply.title")}
      description={t("charts.assetSupply.description")}
      data={chartData}
      config={chartConfig}
      dataKey="totalSupply"
      nameKey="assetType"
      showLegend={true}
    />
  );
}
