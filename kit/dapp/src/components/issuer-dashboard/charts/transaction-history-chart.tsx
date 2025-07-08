import { AreaChartComponent } from "@/components/charts/area-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const dataKeys = ["transactions"];

/**
 * Transaction History Chart Component
 *
 * Displays transaction history over time in an area chart format.
 * Shows daily transaction counts over the last 7 days using time series data.
 */
export function TransactionHistoryChart() {
  const { t } = useTranslation("issuer-dashboard");

  // Fetch metrics summary which includes transaction history time series data
  const { data: metrics } = useSuspenseQuery(
    orpc.metrics.summary.queryOptions({ input: {} })
  );

  // Transform transaction history data for chart display
  const chartData = metrics.transactionHistory.map((dataPoint) => ({
    timestamp: dataPoint.timestamp,
    transactions: dataPoint.transactions,
  }));

  return (
    <AreaChartComponent
      title={t("charts.transactionHistory.title")}
      description={t("charts.transactionHistory.description")}
      data={chartData}
      config={chartConfig}
      dataKeys={dataKeys}
      nameKey="timestamp"
      showYAxis={true}
      showLegend={false}
    />
  );
}
