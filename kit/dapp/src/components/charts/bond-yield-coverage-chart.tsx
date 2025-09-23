import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { type ChartConfig } from "@/components/ui/chart";
import { useBondYieldCoverage } from "@/hooks/use-bond-yield-coverage";
import { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartSkeleton } from "./chart-skeleton";
import { PieChartComponent } from "./pie-chart";

interface BondYieldCoverageChartProps {
  assetAddress: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Bond Yield Coverage Chart Component
 *
 * Displays yield coverage as a pie chart with color-coded risk levels.
 * Shows how well the underlying denomination asset balance covers unclaimed yields.
 *
 * Coverage interpretation:
 * - Red (0-99%): Critical - insufficient coverage for current yields
 * - Yellow (100-199%): Adequate - covers current unclaimed yields
 * - Green (200%+): Excellent - covers current and future yields
 *
 * The chart provides immediate visual feedback for bond yield sustainability assessment.
 */
export function BondYieldCoverageChart({
  assetAddress,
  title,
  description,
  className,
}: BondYieldCoverageChartProps) {
  return (
    <ComponentErrorBoundary componentName="Bond Yield Coverage Chart">
      <Suspense fallback={<ChartSkeleton />}>
        <BondYieldCoverageChartLoader
          assetAddress={assetAddress}
          title={title}
          description={description}
          className={className}
        />
      </Suspense>
    </ComponentErrorBoundary>
  );
}

function BondYieldCoverageChartLoader({
  assetAddress,
  title,
  description,
  className,
}: BondYieldCoverageChartProps) {
  const { t } = useTranslation("stats");
  const { data, isLoading, error } = useBondYieldCoverage({ assetAddress });

  // Transform data for pie chart display showing coverage status
  const chartData = useMemo(() => {
    if (!data?.hasYieldSchedule) {
      return [];
    }

    // For pie chart, show coverage as percentage filled
    const coverage = Math.min(data.yieldCoverage, 100);
    const uncovered = Math.max(0, 100 - coverage);

    return [
      {
        name: "Covered",
        value: coverage,
        fill: getCoverageColor(data.yieldCoverage),
      },
      {
        name: "Uncovered",
        value: uncovered,
        fill: "hsl(var(--muted))",
      },
    ].filter((item) => item.value > 0);
  }, [data]);

  // Chart configuration for pie chart
  const chartConfig: ChartConfig = useMemo(
    () => ({
      covered: {
        label: "Covered",
        color: data ? getCoverageColor(data.yieldCoverage) : "var(--chart-1)",
      },
      uncovered: {
        label: "Uncovered",
        color: "var(--muted)",
      },
    }),
    [t, data]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        emptyMessage={t("charts.common.noData")}
        emptyDescription="Unable to load yield coverage data"
      />
    );
  }

  if (!data?.hasYieldSchedule) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        emptyMessage={"No yield schedule configured"}
        emptyDescription="This bond has no yield schedule configured"
      />
    );
  }

  if (!data.isRunning) {
    return (
      <ChartEmptyState
        title={title}
        description={description}
        className={className}
        emptyMessage={"Yield schedule is not active"}
        emptyDescription="Yield schedule is not currently active"
      />
    );
  }

  return (
    <PieChartComponent
      title={title}
      description={description}
      data={chartData}
      config={chartConfig}
      dataKey="value"
      nameKey="name"
      className={className}
    />
  );
}

/**
 * Determines the color based on coverage percentage
 * Uses traffic light system for immediate risk assessment
 */
function getCoverageColor(coverage: number): string {
  if (coverage < 100) {
    return "hsl(var(--destructive))"; // Red - Critical
  }
  if (coverage < 200) {
    return "hsl(var(--warning))"; // Yellow - Adequate
  }
  return "hsl(var(--success))"; // Green - Excellent
}
