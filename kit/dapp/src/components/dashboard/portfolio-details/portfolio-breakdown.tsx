import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortfolioBreakdownPieChart } from "@/components/stats/charts/portfolio-breakdown-pie-chart";
import type { StatsPortfolioDetailsOutput } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import { PieChart as PieChartIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PortfolioBreakdownTable } from "./portfolio-breakdown-table";

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
  const { t } = useTranslation("stats");

  if (!hasAssets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            {t("charts.portfolio.breakdown.title")}
          </CardTitle>
          <CardDescription>
            {t("charts.portfolio.breakdown.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioBreakdownPieChart
            breakdown={breakdown}
            hasAssets={hasAssets}
            interval={interval}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          {t("charts.portfolio.breakdown.title")}
        </CardTitle>
        <CardDescription>
          {t("charts.portfolio.breakdown.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <PortfolioBreakdownPieChart
            breakdown={breakdown}
            hasAssets={hasAssets}
            interval={interval}
          />

          {/* Breakdown Table */}
          <PortfolioBreakdownTable breakdown={breakdown} />
        </div>
      </CardContent>
    </Card>
  );
}
