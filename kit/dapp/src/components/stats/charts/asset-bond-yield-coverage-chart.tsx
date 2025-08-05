import { PieChartComponent } from "@/components/charts/pie-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { useBondYieldCoverageData } from "@/hooks/use-bond-yield-coverage-data";
import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";

export interface AssetBondYieldCoverageChartProps {
  assetAddress: string;
}

/**
 * Asset Bond Yield Coverage Chart Component
 *
 * Displays bond yield coverage as a donut chart showing:
 * - Coverage percentage (how much underlying asset is available to cover yield payments)
 * - Visual representation of coverage status with color coding:
 *   - Red: <100% (insufficient coverage)
 *   - Yellow: 100-199% (covers current but not next period)
 *   - Green: ≥200% (covers current and next period)
 *
 * This component follows the same pattern as AssetBondStatusProgressChart:
 * - Clean separation of concerns between UI and business logic
 * - Memoized data transformation for optimal performance
 * - Type-safe with comprehensive interfaces
 * - Easily testable with isolated business logic
 */
export function AssetBondYieldCoverageChart({
  assetAddress,
}: AssetBondYieldCoverageChartProps) {
  // Fetch token data and bond yield coverage data in parallel
  const { data: token } = useSuspenseQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: assetAddress },
      ...CHART_QUERY_OPTIONS,
    })
  );

  const { data: yieldCoverage } = useSuspenseQuery(
    orpc.token.statsBondYieldCoverage.queryOptions({
      input: { tokenAddress: assetAddress },
      ...CHART_QUERY_OPTIONS,
    })
  );

  // Transform data using our custom hook
  const chartData = useBondYieldCoverageData(token, yieldCoverage);

  // Create footer JSX from footer data
  const chartFooter = chartData.footerData ? (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="text-2xl font-bold">
        {chartData.footerData.percentage}%
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
    <ComponentErrorBoundary componentName="Asset Bond Yield Coverage Chart">
      <PieChartComponent
        title={chartData.title}
        description={chartData.description}
        data={chartData.data}
        config={chartData.config}
        dataKey="value"
        nameKey="name"
        footer={chartFooter}
      />
    </ComponentErrorBoundary>
  );
}
