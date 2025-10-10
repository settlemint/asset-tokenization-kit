import { withErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import {
  useBondYieldDistribution,
  type YieldDistributionItem,
} from "@/hooks/use-bond-yield-distribution";
import { useTranslation } from "react-i18next";
import { AreaChartComponent } from "./area-chart";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartSkeleton } from "./chart-skeleton";

interface BondYieldDistributionChartProps {
  data: YieldDistributionItem[];
  title: string;
  description?: string;
  className?: string;
}

export const BondYieldDistributionChart = withErrorBoundary(
  BondYieldDistributionChartLoader
);

function BondYieldDistributionChartLoader({
  data,
  title,
  description,
  className,
}: BondYieldDistributionChartProps) {
  const { t } = useTranslation("stats");

  const chartConfig = {
    totalYield: {
      label: t("charts.yieldDistribution.totalYield"),
      color: "var(--chart-1)", // Primary blue for total yield
    },
    claimed: {
      label: t("charts.yieldDistribution.claimed"),
      color: "var(--chart-3)", // Tertiary orange for claimed yield
    },
  } satisfies ChartConfig;

  if (!data || data.length === 0) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        emptyMessage={t("charts.yieldDistribution.noData")}
        emptyDescription="Yield data will appear here once the bond starts generating yields"
      />
    );
  }

  // Format data for the area chart
  const chartData = data.map((item) => ({
    timestamp: new Date(item.timestamp).toLocaleDateString(),
    totalYield: item.totalYield,
    claimed: item.claimed,
  }));

  return (
    <AreaChartComponent
      title={title}
      description={description}
      data={chartData}
      config={chartConfig}
      dataKeys={["totalYield", "claimed"]}
      nameKey="timestamp"
      showYAxis={true}
      showLegend={true}
      stacked={false}
      className={className}
    />
  );
}

interface AsyncBondYieldDistributionChartProps {
  assetAddress: string;
  title: string;
  description?: string;
  className?: string;
}

export const AsyncBondYieldDistributionChart = withErrorBoundary(
  AsyncBondYieldDistributionChartLoader
);

function AsyncBondYieldDistributionChartLoader({
  assetAddress,
  title,
  description,
  className,
}: AsyncBondYieldDistributionChartProps) {
  const { t } = useTranslation("stats");
  const {
    data = [],
    isLoading,
    error,
  } = useBondYieldDistribution({
    assetAddress,
  });

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        emptyMessage={t("charts.yieldDistribution.error")}
        emptyDescription="Please try again later"
      />
    );
  }

  return (
    <BondYieldDistributionChart
      data={data}
      title={title}
      description={description}
      className={className}
    />
  );
}
