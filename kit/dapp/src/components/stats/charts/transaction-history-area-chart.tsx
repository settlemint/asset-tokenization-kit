import { AreaChartComponent } from "@/components/charts/area-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dataKeys = ["transactions"];

/**
 * Transaction History Chart Component
 *
 * Displays transaction history over time in an area chart format.
 * Shows daily transaction counts over the last 7 days using real API data.
 */
export const TransactionHistoryAreaChart = withErrorBoundary(
  function TransactionHistoryAreaChart() {
    const { t } = useTranslation("stats");

    // Fetch just the transaction history data - more efficient
    const { data: metrics } = useSuspenseQuery(
      orpc.system.stats.transactionHistory.queryOptions({
        input: { timeRange: 7 },
      }) // 7 days of data
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
);
