import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenBalance,
  TokenDistributionStatsData,
} from "../../generated/schema";
import { toBigDecimal } from "../utils/token-decimals";

/**
 * Distribution segments for concentration analysis
 * Segment 1: 0-2%
 * Segment 2: 2-10%
 * Segment 3: 10-20%
 * Segment 4: 20-40%
 * Segment 5: 40-100%
 */
class DistributionSegment {
  balancesCount: i32 = 0;
  totalValue: BigDecimal = BigDecimal.zero();
  totalValueExact: BigInt = BigInt.zero();
}

class DistributionStats {
  segments: DistributionSegment[] = [
    new DistributionSegment(),
    new DistributionSegment(),
    new DistributionSegment(),
    new DistributionSegment(),
    new DistributionSegment(),
  ];
  percentageOwnedByTop5Holders: BigDecimal = BigDecimal.zero();
}

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
  accountAddress: Address,
  oldBalance: BigDecimal,
  newBalance: BigDecimal
): void {
  // Skip if total supply is zero
  if (token.totalSupply.equals(BigDecimal.zero())) {
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

  // If segment hasn't changed and balance hasn't changed significantly, skip
  if (oldSegment == newSegment && oldBalance.equals(newBalance)) {
    return;
  }

  // Calculate full distribution stats (we need this for top 5 holders)
  const stats = calculateFullDistributionStats(token);

  // Create timeseries entry
  trackTokenDistributionStats(token, stats);
}

/**
 * Calculate full distribution statistics for a token
 * This is called only when needed (on balance changes)
 */
function calculateFullDistributionStats(token: Token): DistributionStats {
  const stats = new DistributionStats();

  // Load all non-zero balances for this token
  const balances = token.balances.load();

  // Sort balances by value for top 5 calculation
  const sortedBalances = balances
    .filter((balance) => balance.value.gt(BigDecimal.zero()))
    .sort((a, b) => {
      if (a.value.gt(b.value)) return -1;
      if (a.value.lt(b.value)) return 1;
      return 0;
    });

  // Calculate top 5 holders percentage
  if (sortedBalances.length > 0) {
    let top5Total = BigDecimal.zero();
    const limit = Math.min(5, sortedBalances.length) as i32;

    for (let i = 0; i < limit; i++) {
      top5Total = top5Total.plus(sortedBalances[i].value);
    }

    stats.percentageOwnedByTop5Holders = top5Total
      .times(BigDecimal.fromString("100"))
      .div(token.totalSupply);
  }

  // Calculate segment distribution
  for (let i = 0; i < sortedBalances.length; i++) {
    const balance = sortedBalances[i];
    const percentage = balance.value
      .times(BigDecimal.fromString("100"))
      .div(token.totalSupply);

    const segmentIndex = getSegmentIndex(percentage);
    stats.segments[segmentIndex].balancesCount += 1;
    stats.segments[segmentIndex].totalValue = stats.segments[
      segmentIndex
    ].totalValue.plus(balance.value);
    stats.segments[segmentIndex].totalValueExact = stats.segments[
      segmentIndex
    ].totalValueExact.plus(balance.valueExact);
  }

  return stats;
}

/**
 * Track token distribution statistics in timeseries
 */
function trackTokenDistributionStats(
  token: Token,
  stats: DistributionStats
): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const distributionStats = new TokenDistributionStatsData(1);

  distributionStats.token = token.id;
  distributionStats.percentageOwnedByTop5Holders =
    stats.percentageOwnedByTop5Holders;

  // Set segment 1 (0-2%)
  distributionStats.balancesCountSegment1 = stats.segments[0].balancesCount;
  distributionStats.totalValueSegment1 = stats.segments[0].totalValue;
  distributionStats.totalValueSegment1Exact = stats.segments[0].totalValueExact;

  // Set segment 2 (2-10%)
  distributionStats.balancesCountSegment2 = stats.segments[1].balancesCount;
  distributionStats.totalValueSegment2 = stats.segments[1].totalValue;
  distributionStats.totalValueSegment2Exact = stats.segments[1].totalValueExact;

  // Set segment 3 (10-20%)
  distributionStats.balancesCountSegment3 = stats.segments[2].balancesCount;
  distributionStats.totalValueSegment3 = stats.segments[2].totalValue;
  distributionStats.totalValueSegment3Exact = stats.segments[2].totalValueExact;

  // Set segment 4 (20-40%)
  distributionStats.balancesCountSegment4 = stats.segments[3].balancesCount;
  distributionStats.totalValueSegment4 = stats.segments[3].totalValue;
  distributionStats.totalValueSegment4Exact = stats.segments[3].totalValueExact;

  // Set segment 5 (40-100%)
  distributionStats.balancesCountSegment5 = stats.segments[4].balancesCount;
  distributionStats.totalValueSegment5 = stats.segments[4].totalValue;
  distributionStats.totalValueSegment5Exact = stats.segments[4].totalValueExact;

  distributionStats.save();
}

/**
 * Initialize distribution stats for a new token
 */
export function initializeTokenDistributionStats(token: Token): void {
  const stats = new DistributionStats();
  trackTokenDistributionStats(token, stats);
}
