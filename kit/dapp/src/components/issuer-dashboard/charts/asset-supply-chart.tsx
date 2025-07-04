import { PieChartComponent } from "@/components/charts/pie-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  bonds: { label: "Bonds", color: "hsl(var(--chart-1))" },
  equity: { label: "Equity", color: "hsl(var(--chart-2))" },
  funds: { label: "Funds", color: "hsl(var(--chart-3))" },
  stablecoins: { label: "Stablecoins", color: "hsl(var(--chart-4))" },
  deposits: { label: "Deposits", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

/**
 * Asset Supply Chart Component
 *
 * Displays the distribution of different asset types across the platform
 * using a pie chart visualization.
 */
export function AssetSupplyChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch factories to analyze asset distribution
  const { data: factories } = useSuspenseQuery(
    orpc.token.factoryList.queryOptions({ input: {} })
  );

  // Group factories by asset type
  const assetTypeCount = factories.reduce(
    (acc, factory) => {
      const typeId = factory.typeId;
      acc[typeId] = (acc[typeId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Convert to chart data format
  const chartData = Object.entries(assetTypeCount).map(([type, count]) => ({
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
