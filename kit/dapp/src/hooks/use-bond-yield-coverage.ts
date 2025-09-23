import { CHART_QUERY_OPTIONS } from "@/lib/query-options";
import { orpc } from "@/orpc/orpc-client";
import type { StatsYieldCoverageOutput } from "@/orpc/routes/token/routes/stats/yield-coverage.schema";
import { useQuery } from "@tanstack/react-query";

/**
 * Bond Yield Coverage Hook
 *
 * Provides real-time yield coverage data for bond risk assessment.
 * Coverage indicates how well the underlying denomination asset
 * balance can support future yield payments.
 *
 * Coverage levels:
 * - 0-99%: Critical - insufficient coverage
 * - 100-199%: Adequate - covers current yield
 * - 200%+: Excellent - covers current and future yields
 *
 * @param assetAddress - The bond token contract address
 * @returns Query result with yield coverage data and loading state
 *
 * @example
 * ```tsx
 * function YieldCoverageDisplay({ bondAddress }: { bondAddress: string }) {
 *   const { data, isLoading } = useBondYieldCoverage({ assetAddress: bondAddress });
 *
 *   if (!data?.hasYieldSchedule) return <div>No yield schedule</div>;
 *
 *   const riskLevel = data.yieldCoverage < 100 ? 'critical' :
 *                    data.yieldCoverage < 200 ? 'adequate' : 'excellent';
 *
 *   return <div className={riskLevel}>Coverage: {data.yieldCoverage}%</div>;
 * }
 * ```
 */
interface UseBondYieldCoverageOptions {
  assetAddress: string;
}

export function useBondYieldCoverage({
  assetAddress,
}: UseBondYieldCoverageOptions) {
  return useQuery({
    ...orpc.token.statsYieldCoverage.queryOptions({
      input: { tokenAddress: assetAddress },
    }),
    // Use chart-optimized query settings for consistent caching behavior
    ...CHART_QUERY_OPTIONS,
  });
}

/**
 * Type export for component consumption
 */
export type YieldCoverageData = StatsYieldCoverageOutput;
