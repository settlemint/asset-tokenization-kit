import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpc } from "@/orpc/orpc-client";
import type { StatsPortfolioDetailsOutput } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toNumber } from "dnum";
import { PieChart as PieChartIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

interface PortfolioBreakdownProps {
  breakdown: StatsPortfolioDetailsOutput["tokenFactoryBreakdown"];
  hasAssets: boolean;
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
}: PortfolioBreakdownProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  const { chartData, chartConfig } = useMemo(() => {
    if (!hasAssets) {
      return { chartData: [], chartConfig: {} };
    }

    const data = breakdown.map((item, index) => ({
      assetType: item.assetType,
      value: toNumber(item.totalValue),
      percentage: item.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

    const config: ChartConfig = breakdown.reduce<ChartConfig>(
      (acc, item, index) => {
        acc[item.assetType] = {
          label:
            item.assetType.charAt(0).toUpperCase() + item.assetType.slice(1),
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
        return acc;
      },
      {}
    );

    return { chartData: data, chartConfig: config };
  }, [breakdown, hasAssets]);

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
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
            <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {t("charts.portfolio.empty.breakdown")}
              </span>
            </div>
          </div>
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
        <div className="space-y-6">
          {/* Pie Chart */}
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  nameKey="assetType"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Breakdown Table */}
          {/* TODO: @snigdha920 use table component */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("charts.portfolio.breakdown.detailsTitle")}
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("charts.portfolio.breakdown.assetType")}
                  </TableHead>
                  <TableHead>
                    {t("charts.portfolio.breakdown.factory")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("charts.portfolio.breakdown.value")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("charts.portfolio.breakdown.percentage")}
                  </TableHead>
                  <TableHead className="text-right">
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
                    <TableCell>{item.tokenFactoryName}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: baseCurrency ?? "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(toNumber(item.totalValue))}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.tokenBalancesCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
