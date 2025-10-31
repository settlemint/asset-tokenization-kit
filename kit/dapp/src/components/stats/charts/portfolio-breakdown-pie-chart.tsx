import { ASSET_COLORS } from "@/components/assets/asset-colors";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { type ChartConfig } from "@/components/ui/chart";
import type { StatsPortfolioDetailsOutput } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import { toNumber } from "dnum";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface PortfolioBreakdownPieChartProps {
  breakdown: StatsPortfolioDetailsOutput["tokenFactoryBreakdown"];
  hasAssets: boolean;
  interval?: "hour" | "day";
}

export function PortfolioBreakdownPieChart({
  breakdown,
  hasAssets,
  interval = "hour",
}: PortfolioBreakdownPieChartProps) {
  const { t } = useTranslation("stats");

  const { chartData, chartConfig } = useMemo(() => {
    if (!hasAssets) {
      return { chartData: [], chartConfig: {} };
    }

    const data = breakdown.map((item) => ({
      assetType: item.assetType,
      value: toNumber(item.totalValue),
      percentage: item.percentage,
      fill: ASSET_COLORS[item.assetType],
    }));

    const config: ChartConfig = breakdown.reduce<ChartConfig>((acc, item) => {
      const capitalizedLabel =
        item.assetType.charAt(0).toUpperCase() + item.assetType.slice(1);
      const displayValue =
        item.percentage < 1 ? "< 1%" : `${Math.floor(item.percentage)}%`;
      acc[item.assetType] = {
        label: `${capitalizedLabel} ${displayValue}`,
        color: ASSET_COLORS[item.assetType],
      };
      return acc;
    }, {});

    return { chartData: data, chartConfig: config };
  }, [breakdown, hasAssets]);

  return (
    <PieChartComponent
      title={t("charts.portfolio.breakdown.chartTitle")}
      description={t("charts.portfolio.breakdown.chartDescription")}
      data={chartData}
      config={chartConfig}
      dataKey="value"
      nameKey="assetType"
      interval={interval}
      emptyMessage={t("charts.portfolio.empty.breakdown")}
      className="border-0 shadow-none"
    />
  );
}
