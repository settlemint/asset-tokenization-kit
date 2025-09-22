import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PortfolioBreakdownPieChart } from "@/components/stats/charts/portfolio-breakdown-pie-chart";
import { orpc } from "@/orpc/orpc-client";
import type { StatsPortfolioDetailsOutput } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toNumber } from "dnum";
import { PieChart as PieChartIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PortfolioBreakdownProps {
  breakdown: StatsPortfolioDetailsOutput["tokenFactoryBreakdown"];
  hasAssets: boolean;
  interval?: "hour" | "day";
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function PortfolioBreakdown({
  breakdown,
  hasAssets,
  interval = "hour",
}: PortfolioBreakdownProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

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
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("charts.portfolio.breakdown.detailsTitle")}
            </h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("charts.portfolio.breakdown.assetType")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("charts.portfolio.breakdown.value")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("charts.portfolio.breakdown.percentage")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("charts.portfolio.breakdown.assets")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.map((item, index) => (
                    <TableRow key={item.tokenFactoryId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          {item.assetType.charAt(0).toUpperCase() +
                            item.assetType.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: baseCurrency ?? "USD",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(toNumber(item.totalValue))}
                      </TableCell>
                      <TableCell className="text-left">
                        {item.percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-left">
                        {item.tokenBalancesCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
