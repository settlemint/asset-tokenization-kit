import { BarChartComponent } from "@/components/charts/bar-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const chartConfig = {
  mint: {
    label: "Mint",
    color: "var(--chart-1)",
  },
  transfer: {
    label: "Transfer",
    color: "var(--chart-2)",
  },
  burn: {
    label: "Burn",
    color: "var(--chart-3)",
  },
  clawback: {
    label: "Clawback",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const dataKeys = ["mint", "transfer", "burn", "clawback"];

/**
 * Asset Activity Chart Component
 *
 * Displays the distribution of events by asset type in a bar chart format.
 * Shows different event types (mint, transfer, burn, clawback) for asset types with activity.
 */
export function AssetActivityBarChart() {
  const { t } = useTranslation("stats");

  // Fetch transaction data as activity proxy
  const { data: _metrics } = useSuspenseQuery(
    orpc.token.statsSystemTransactionHistory.queryOptions({ input: {} })
  );

  // No asset-specific activity data available, return empty for empty state
  const chartData: Array<{
    assetType: string;
    mint: number;
    transfer: number;
    burn: number;
    clawback: number;
  }> = [];

  return (
    <ComponentErrorBoundary componentName="Asset Activity Chart">
      <BarChartComponent
        title={t("charts.assetActivity.title")}
        description={t("charts.assetActivity.description")}
        data={chartData}
        config={chartConfig}
        dataKeys={dataKeys}
        nameKey="assetType"
        showYAxis={false}
        showLegend={true}
      />
    </ComponentErrorBoundary>
  );
}
