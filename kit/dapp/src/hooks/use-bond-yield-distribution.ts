import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import type { Dnum } from "dnum";
import { useMemo } from "react";

/**
 * Simplified yield distribution data item for chart rendering.
 *
 * Excludes unclaimed amounts to focus on the core metrics needed
 * for yield distribution visualization components.
 */
export interface YieldDistributionItem {
  /** Unix timestamp in milliseconds for chart x-axis positioning */
  timestamp: Date;
  /** Total yield generated in this period (human-readable format) */
  totalYield: Dnum;
  /** Amount of yield claimed by holders (human-readable format) */
  claimed: Dnum;
}

/**
 * Configuration options for the bond yield distribution hook.
 */
interface UseBondYieldDistributionOptions {
  /** The bond token contract address to fetch distribution data for */
  assetAddress: string;
}

/**
 * React hook for fetching and transforming bond yield distribution data.
 *
 * This hook is designed specifically for chart components that need to visualize
 * yield generation and claiming patterns over time. It transforms the raw API
 * response into a simplified format optimized for chart libraries.
 *
 * The hook applies chart-specific query options (longer stale time, background
 * refetch) because yield distribution data changes infrequently and charts
 * benefit from stable data during user interaction.
 *
 * @param options - Configuration options including the bond token address
 * @returns Object containing transformed data array and query state
 *
 * @example
 * ```tsx
 * function YieldChart({ bondAddress }: { bondAddress: string }) {
 *   const { data, isLoading, error } = useBondYieldDistribution({
 *     assetAddress: bondAddress
 *   });
 *
 *   if (isLoading) return <ChartSkeleton />;
 *   if (error) return <ErrorMessage />;
 *
 *   return (
 *     <LineChart data={data}>
 *       <Line dataKey="totalYield" stroke="#8884d8" />
 *       <Line dataKey="claimed" stroke="#82ca9d" />
 *     </LineChart>
 *   );
 * }
 * ```
 */
export function useBondYieldDistribution({
  assetAddress,
}: UseBondYieldDistributionOptions) {
  const query = useQuery(
    orpc.token.statsYieldDistribution.queryOptions({
      input: { tokenAddress: assetAddress },
      ...CHART_QUERY_OPTIONS,
    })
  );

  /**
   * Transform API response to chart-optimized format.
   *
   * We memoize this transformation because:
   * 1. Chart re-renders are expensive and should be minimized
   * 2. The transformation creates new objects that would trigger unnecessary re-renders
   * 3. Yield distribution data is relatively stable, so caching is beneficial
   *
   * We exclude 'unclaimed' amounts from the chart interface to keep visualizations
   * focused on the primary metrics: total generation vs actual claims.
   */
  const data = useMemo(() => {
    if (!query.data?.periods) {
      return [];
    }

    return query.data.periods.map((period) => ({
      timestamp: period.timestamp,
      totalYield: period.totalYield,
      claimed: period.claimed,
    }));
  }, [query.data?.periods]);

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
