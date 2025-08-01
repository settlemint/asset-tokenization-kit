import { PieChartComponent } from "@/components/charts/pie-chart";
import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { useBondStatusData } from "@/hooks/use-bond-status-data";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export interface AssetBondStatusProgressChartProps {
  assetAddress: string;
}

/**
 * Asset Bond Status Progress Chart Component
 *
 * Displays bond status progress as a donut chart showing different states:
 * - Issuing: Progress of bond issuance against cap
 * - Active: Progress of underlying asset accumulation for redemption
 * - Matured: Progress of bond redemption
 *
 * This component follows the Strategy Pattern with Custom Hooks:
 * - Clean separation of concerns between UI and business logic
 * - Memoized strategies for optimal performance
 * - Type-safe with comprehensive interfaces
 * - Easily testable with isolated business logic
 */
export function AssetBondStatusProgressChart({
  assetAddress,
}: AssetBondStatusProgressChartProps) {
  const { t } = useTranslation(["stats", "tokens"]);

  // Fetch token data and bond status data in parallel
  const { data: token } = useSuspenseQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: assetAddress },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })
  );

  const { data: bondStatus } = useSuspenseQuery(
    orpc.token.statsBondStatus.queryOptions({
      input: { tokenAddress: assetAddress },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    })
  );

  // Transform data using our custom hook with strategy pattern
  const chartData = useBondStatusData(token, bondStatus);

  // Create footer JSX from footer data
  const footer = chartData.footerData ? (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="text-2xl font-bold">{chartData.footerData.progress}%</div>
      <div className="text-sm text-muted-foreground text-center">
        <div className="capitalize font-medium text-foreground">
          {chartData.footerData.label}
        </div>
      </div>
    </div>
  ) : null;

  // Handle non-bond assets or empty data
  if (!token.bond || chartData.isEmpty) {
    return (
      <ComponentErrorBoundary componentName="Asset Bond Status Progress Chart">
        <PieChartComponent
          title={chartData.title}
          description={chartData.description}
          data={[]}
          config={{}}
          dataKey="value"
          nameKey="name"
          emptyMessage={t("stats:charts.bondStatus.notAvailable")}
        />
      </ComponentErrorBoundary>
    );
  }

  // Render the chart with processed data
  return (
    <ComponentErrorBoundary componentName="Asset Bond Status Progress Chart">
      <PieChartComponent
        title={chartData.title}
        description={chartData.description}
        data={chartData.data}
        config={chartData.config}
        dataKey="value"
        nameKey="name"
        footer={footer}
      />
    </ComponentErrorBoundary>
  );
}
