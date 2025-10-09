import { PieChartComponent } from "@/components/charts/pie-chart";
import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { useBondStatusData } from "@/hooks/use-bond-status-data";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export interface AssetBondStatusProgressChartProps {
  assetAddress: string;
}

/**
 * Asset Bond Status Progress Chart Component
 *
 * Displays bond status progress as a donut chart showing different states:
 * - Issuing: Progress of bond issuance against cap
 * - Active: Progress of denomination asset accumulation for redemption
 * - Matured: Progress of bond redemption
 *
 * This component follows the Strategy Pattern with Custom Hooks:
 * - Clean separation of concerns between UI and business logic
 * - Memoized strategies for optimal performance
 * - Type-safe with comprehensive interfaces
 * - Easily testable with isolated business logic
 */
export const AssetBondStatusProgressChart = withErrorBoundary(
  function AssetBondStatusProgressChart({
    assetAddress,
  }: AssetBondStatusProgressChartProps) {
    // Fetch token data and bond status data in parallel
    const { data: token } = useSuspenseQuery(
      orpc.token.read.queryOptions({
        input: { tokenAddress: assetAddress },
        ...CHART_QUERY_OPTIONS,
      })
    );

    const { data: bondStatus } = useSuspenseQuery(
      orpc.token.statsBondStatus.queryOptions({
        input: { tokenAddress: assetAddress },
        ...CHART_QUERY_OPTIONS,
      })
    );

    // Transform data using our custom hook with strategy pattern
    const chartData = useBondStatusData(token, bondStatus);

    // Create footer JSX from footer data
    const chartFooter = chartData.footerData ? (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="text-2xl font-bold">
          {chartData.footerData.progress}%
        </div>
        <div className="text-sm text-muted-foreground text-center">
          <div className="capitalize font-medium text-foreground">
            {chartData.footerData.label}
          </div>
        </div>
      </div>
    ) : null;

    // Render the chart with processed data
    return (
      <PieChartComponent
        title={chartData.title}
        description={chartData.description}
        data={chartData.data}
        config={chartData.config}
        dataKey="value"
        nameKey="name"
        footer={chartFooter}
      />
    );
  }
);
