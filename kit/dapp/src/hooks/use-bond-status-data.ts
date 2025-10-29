import type { ChartConfig } from "@/components/ui/chart";
import { getBondStatusStrategy } from "@/lib/strategies/bond-status-strategies";
import type { StatsBondStatusOutput } from "@/orpc/routes/token/routes/stats/bond-status.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { BondChartData } from "@/types/bond-status";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Custom hook for processing bond status data into chart-ready format
 *
 * Follows the React Performance Architect's recommendations:
 * - Memoized strategy instances for performance
 * - Separated business logic from UI rendering
 * - Proper dependency arrays to prevent unnecessary recalculations
 * - Type-safe with comprehensive interfaces
 *
 * @param token - Token data from orpc.token.read
 * @param bondStatus - Bond status data from orpc.token.statsBondStatus
 * @returns Chart-ready data or empty state for non-bond assets
 */
export function useBondStatusData(
  token: Token,
  bondStatus: StatsBondStatusOutput
): BondChartData {
  const { t } = useTranslation(["stats", "tokens"]);

  return useMemo(() => {
    // Get the appropriate strategy for current bond state
    const strategy = getBondStatusStrategy(token);

    // Calculate progress using the strategy
    const progressData = strategy.calculateProgress(token, bondStatus);

    // Get display data using the strategy
    const displayData = strategy.getDisplayData(t, progressData.progress);

    // Create chart data for donut visualization
    const chartData = [
      {
        name: "completed",
        value: Math.min(progressData.progress, 100), // Cap at 100%
        fill: displayData.color,
      },
      {
        name: "remaining",
        value: Math.max(0, 100 - progressData.progress), // Ensure non-negative
        fill: "hsl(var(--muted))",
      },
    ];

    // Create chart configuration
    const config: ChartConfig = {
      completed: {
        label: t("stats:charts.bondStatus.completed"),
        color: displayData.color,
      },
      remaining: {
        label: t("stats:charts.bondStatus.remaining"),
        color: "hsl(var(--muted))",
      },
    };

    // Return footer data instead of JSX
    const footerData = {
      progress: Math.round(Math.min(progressData.progress, 100)),
      label: displayData.label,
    };

    return {
      data: chartData,
      config,
      title: displayData.title,
      description: displayData.description,
      footerData,
      progress: Math.round(Math.min(progressData.progress, 100)),
      status: progressData.status,
      isEmpty: false,
    };
  }, [token, bondStatus, t]);
}

/**
 * Simplified hook that just returns whether a token is a bond
 * Useful for conditional rendering
 *
 * @param token - Token data from orpc.token.read
 * @returns Whether the token is a bond asset
 */
export function useIsBond(token: Token): boolean {
  return useMemo(() => Boolean(token.bond), [token.bond]);
}
