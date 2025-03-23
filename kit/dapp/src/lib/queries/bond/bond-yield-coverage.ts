import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Address } from "viem";
import type { YieldCoverage } from "./bond-schema";

interface GetBondYieldCoverageParams {
  address: Address;
}

/**
 * Get yield coverage data for a bond asset
 * Calculates what percentage of yield is covered by the underlying asset
 *
 * - 0-99%: Not enough to cover unclaimed yield (RED)
 * - 100-199%: Enough to cover current unclaimed yield but not next period (YELLOW)
 * - 200%+: Enough to cover both current unclaimed yield and next period (GREEN)
 *
 * @param params The parameters for the query
 * @returns The yield coverage data including percentage and status flags
 */
export async function getBondYieldCoverage({
  address,
}: GetBondYieldCoverageParams): Promise<YieldCoverage> {
  // Get bond details
  const bondData = await getBondDetail({ address });

  // Check if bond has a yield schedule
  const hasYieldSchedule = !!bondData.yieldSchedule;

  // Default values if no yield schedule exists
  if (!hasYieldSchedule || !bondData.yieldSchedule) {
    return {
      yieldCoverage: 0,
      hasYieldSchedule: false,
      isRunning: false,
    };
  }

  // Get current timestamp to check if yield is currently running
  const now = BigInt(Math.floor(Date.now() / 1000));
  const { startDate, endDate, unclaimedYieldExact, underlyingBalanceExact } =
    bondData.yieldSchedule;
  const isRunning = now >= startDate && now <= endDate;

  // If not running, return 0 coverage
  if (!isRunning) {
    return {
      yieldCoverage: 0,
      hasYieldSchedule: true,
      isRunning: false,
    };
  }

  // Calculate yield coverage percentage
  let yieldCoverage = 0;

  if (unclaimedYieldExact > 0n) {
    // Calculate how much of the unclaimed yield is covered
    // 100% means exactly covering the unclaimed yield
    // 200% means covering both current and next yield periods

    // Calculate the base coverage (100% = just covering current unclaimed yield)
    const baseCoverage = Number(
      (underlyingBalanceExact * 100n) / unclaimedYieldExact
    );

    // If we have just enough to cover the current unclaimed yield, that's 100%
    // If we have enough to cover current unclaimed yield + an equal amount (next period),
    // that's 200%
    yieldCoverage = baseCoverage;
  } else {
    // If there's no unclaimed yield but there's an underlying balance,
    // we have effectively 200% coverage (more than enough for next periods)
    yieldCoverage = underlyingBalanceExact > 0n ? 200 : 0;
  }

  return {
    yieldCoverage,
    hasYieldSchedule: true,
    isRunning,
  };
}
