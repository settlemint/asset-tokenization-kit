import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Token, TokenDistributionStatsData } from "../../generated/schema";

/**
 * Distribution segments for concentration analysis
 * Segment 1: 0-2%
 * Segment 2: 2-10%
 * Segment 3: 10-20%
 * Segment 4: 20-40%
 * Segment 5: 40-100%
 */

/**
 * Calculate which segment a balance belongs to based on percentage of total supply
 */
function getSegmentIndex(percentage: BigDecimal): i32 {
  if (percentage.le(BigDecimal.fromString("2"))) return 0;
  if (percentage.le(BigDecimal.fromString("10"))) return 1;
  if (percentage.le(BigDecimal.fromString("20"))) return 2;
  if (percentage.le(BigDecimal.fromString("40"))) return 3;
  return 4;
}

/**
 * Update token distribution stats when balance changes
 * This efficiently updates only the affected segments
 */
export function updateTokenDistributionStats(
  token: Token,
  oldBalance: BigDecimal,
  newBalance: BigDecimal
): void {
  // Skip if total supply is zero or balance hasn't changed
  if (
    token.totalSupply.equals(BigDecimal.zero()) ||
    oldBalance.equals(newBalance)
  ) {
    return;
  }

  // Calculate old and new percentages
  const oldPercentage = oldBalance
    .times(BigDecimal.fromString("100"))
    .div(token.totalSupply);
  const newPercentage = newBalance
    .times(BigDecimal.fromString("100"))
    .div(token.totalSupply);

  // Determine segment changes
  const oldSegment = oldBalance.gt(BigDecimal.zero())
    ? getSegmentIndex(oldPercentage)
    : -1;
  const newSegment = newBalance.gt(BigDecimal.zero())
    ? getSegmentIndex(newPercentage)
    : -1;

  // If segment hasn't changed and balance hasn't changed, skip
  if (oldSegment == newSegment) {
    return;
  }

  // For now, just create a basic timeseries entry to avoid loading all balances
  trackTokenDistributionStats(token);
}

/**
 * Track token distribution statistics in timeseries
 */
function trackTokenDistributionStats(token: Token): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const distributionStats = new TokenDistributionStatsData(1);

  distributionStats.token = token.id;
  distributionStats.percentageOwnedByTop5Holders = BigDecimal.zero();

  // Set all segments to zero for now (will be improved later)
  distributionStats.balancesCountSegment1 = 0;
  distributionStats.totalValueSegment1 = BigDecimal.zero();
  distributionStats.totalValueSegment1Exact = BigInt.zero();

  distributionStats.balancesCountSegment2 = 0;
  distributionStats.totalValueSegment2 = BigDecimal.zero();
  distributionStats.totalValueSegment2Exact = BigInt.zero();

  distributionStats.balancesCountSegment3 = 0;
  distributionStats.totalValueSegment3 = BigDecimal.zero();
  distributionStats.totalValueSegment3Exact = BigInt.zero();

  distributionStats.balancesCountSegment4 = 0;
  distributionStats.totalValueSegment4 = BigDecimal.zero();
  distributionStats.totalValueSegment4Exact = BigInt.zero();

  distributionStats.balancesCountSegment5 = 0;
  distributionStats.totalValueSegment5 = BigDecimal.zero();
  distributionStats.totalValueSegment5Exact = BigInt.zero();

  distributionStats.save();
}

/**
 * Initialize distribution stats for a new token
 */
export function initializeTokenDistributionStats(token: Token): void {
  trackTokenDistributionStats(token);
}
