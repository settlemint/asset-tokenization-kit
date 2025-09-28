import { PortfolioBreakdownPieChart } from "@/components/stats/charts/portfolio-breakdown-pie-chart";
import { PortfolioValueAreaChart } from "@/components/stats/charts/portfolio-value-area-chart";
import type { StatsPortfolioDetailsOutput } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";

interface PortfolioBreakdownProps {
  breakdown: StatsPortfolioDetailsOutput["tokenFactoryBreakdown"];
  hasAssets: boolean;
  interval?: "hour" | "day";
}

export function PortfolioBreakdown({
  breakdown,
  hasAssets,
  interval = "hour",
}: PortfolioBreakdownProps) {
  if (!hasAssets) {
    return (
      <PortfolioBreakdownPieChart
        breakdown={breakdown}
        hasAssets={hasAssets}
        interval={interval}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PortfolioBreakdownPieChart
        breakdown={breakdown}
        hasAssets={hasAssets}
        interval={interval}
      />
      <PortfolioValueAreaChart range="trailing7Days" />
    </div>
  );
}
