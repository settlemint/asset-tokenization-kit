import type { ChartConfig } from "@/components/ui/chart";
import type { StatsBondYieldCoverageOutput } from "@/orpc/routes/token/routes/stats/bond-yield-coverage.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { toNumber } from "dnum";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type ChartDataPoint = {
  name: "covered" | "uncovered";
  value: number;
  fill: string;
};

export interface YieldCoverageChartData {
  data: ChartDataPoint[];
  config: ChartConfig;
  title: string;
  description: string;
  footerData?: {
    percentage: number;
    label: string;
  };
  isEmpty: boolean;
}

/**
 * Custom hook for processing bond yield coverage data into chart-ready format
 *
 * Transforms yield coverage data into a donut chart visualization showing:
 * - Coverage percentage with color-coded thresholds
 * - Empty state for tokens without yield schedules
 * - Inactive state for non-running yield schedules
 *
 * @param token - Token data from orpc.token.read
 * @param yieldCoverage - Yield coverage data from orpc.token.statsBondYieldCoverage
 * @returns Chart-ready data with appropriate visualization state
 */
export function useBondYieldCoverageData(
  token: Token,
  yieldCoverage: StatsBondYieldCoverageOutput
): YieldCoverageChartData {
  const { t } = useTranslation(["stats", "tokens"]);

  return useMemo(() => {
    // Handle empty states
    if (!token.bond) {
      return {
        data: [],
        config: {},
        title: t("stats:charts.yieldCoverage.title"),
        description: t("stats:charts.yieldCoverage.notBond"),
        isEmpty: true,
      };
    }

    if (!yieldCoverage.hasYieldSchedule) {
      return {
        data: [],
        config: {},
        title: t("stats:charts.yieldCoverage.title"),
        description: t("stats:charts.yieldCoverage.noSchedule"),
        isEmpty: true,
      };
    }

    if (!yieldCoverage.isRunning) {
      return {
        data: [],
        config: {},
        title: t("stats:charts.yieldCoverage.title"),
        description: t("stats:charts.yieldCoverage.notActive"),
        isEmpty: true,
      };
    }

    // Calculate coverage percentage - don't cap at 100% as bonds can have >200% coverage
    const rawCoveragePercent = toNumber(yieldCoverage.yieldCoverage);
    // Ensure non-negative values for display
    const coveragePercent = Math.max(0, rawCoveragePercent);

    // Determine color based on thresholds
    // Red: <100% (insufficient coverage)
    // Yellow: 100-199% (covers current but not next period)
    // Green: ≥200% (covers current and next period)
    let color: string;
    let statusLabel: string;

    if (coveragePercent < 100) {
      color = "hsl(var(--destructive))";
      statusLabel = t("stats:charts.yieldCoverage.insufficient");
    } else if (coveragePercent < 200) {
      color = "hsl(var(--warning))";
      statusLabel = t("stats:charts.yieldCoverage.currentPeriod");
    } else {
      color = "hsl(var(--success))";
      statusLabel = t("stats:charts.yieldCoverage.fullCoverage");
    }

    // Create chart data for donut visualization
    // For coverage > 100%, show 100% covered with no uncovered portion
    const displayCovered = Math.min(100, coveragePercent);
    const displayUncovered = Math.max(0, 100 - coveragePercent);

    const chartData = [
      {
        name: "covered" as const,
        value: displayCovered,
        fill: color,
      },
      {
        name: "uncovered" as const,
        value: displayUncovered,
        fill: "hsl(var(--muted))",
      },
    ];

    // Create chart configuration
    const config: ChartConfig = {
      covered: {
        label: t("stats:charts.yieldCoverage.covered"),
        color,
      },
      uncovered: {
        label: t("stats:charts.yieldCoverage.uncovered"),
        color: "hsl(var(--muted))",
      },
    };

    // Return footer data
    const footerData = {
      percentage: Math.round(coveragePercent),
      label: statusLabel,
    };

    return {
      data: chartData,
      config,
      title: t("stats:charts.yieldCoverage.title"),
      description: t("stats:charts.yieldCoverage.description"),
      footerData,
      isEmpty: false,
    };
  }, [
    token.bond,
    yieldCoverage.hasYieldSchedule,
    yieldCoverage.isRunning,
    yieldCoverage.yieldCoverage,
    t,
  ]);
}
