import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenDistributionStatsData,
  TokenDistributionStatsState,
} from "../../generated/schema";
import { setBigNumber } from "../utils/bignumber";

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
function getSegmentIndex(percentage: BigInt): i32 {
  if (percentage.le(BigInt.fromString("2"))) return 0;
  if (percentage.le(BigInt.fromString("10"))) return 1;
  if (percentage.le(BigInt.fromString("20"))) return 2;
  if (percentage.le(BigInt.fromString("40"))) return 3;
  return 4;
}

/**
 * Fetch or create TokenDistributionStatsState entity
 */
function fetchTokenDistributionStatsState(
  tokenAddress: Address
): TokenDistributionStatsState {
  let state = TokenDistributionStatsState.load(tokenAddress);

  if (!state) {
    state = new TokenDistributionStatsState(tokenAddress);
    state.token = tokenAddress;
    state.lastUpdated = BigInt.zero();
    state.holdersCount = 0;
    state.percentageOwnedByTop5Holders = BigDecimal.zero();

    // Initialize all segments
    state.balancesCountSegment1 = 0;
    state.totalValueSegment1 = BigDecimal.zero();
    state.totalValueSegment1Exact = BigInt.zero();

    state.balancesCountSegment2 = 0;
    state.totalValueSegment2 = BigDecimal.zero();
    state.totalValueSegment2Exact = BigInt.zero();

    state.balancesCountSegment3 = 0;
    state.totalValueSegment3 = BigDecimal.zero();
    state.totalValueSegment3Exact = BigInt.zero();

    state.balancesCountSegment4 = 0;
    state.totalValueSegment4 = BigDecimal.zero();
    state.totalValueSegment4Exact = BigInt.zero();

    state.balancesCountSegment5 = 0;
    state.totalValueSegment5 = BigDecimal.zero();
    state.totalValueSegment5Exact = BigInt.zero();

    state.save();
  }

  return state;
}

/**
 * Update token distribution stats when balance changes
 * This efficiently updates only the affected segments
 */
export function updateTokenDistributionStats(
  token: Token,
  oldBalance: BigInt,
  newBalance: BigInt
): void {
  // Skip if total supply is zero or balance hasn't changed
  if (
    token.totalSupply.equals(BigDecimal.zero()) ||
    oldBalance.equals(newBalance)
  ) {
    return;
  }

  // Calculate old and new percentages
  const oldPercentage = oldBalance.gt(BigInt.zero())
    ? oldBalance.times(BigInt.fromString("100")).div(token.totalSupplyExact)
    : BigInt.zero();
  const newPercentage = newBalance.gt(BigInt.zero())
    ? newBalance.times(BigInt.fromString("100")).div(token.totalSupplyExact)
    : BigInt.zero();

  // Determine segment changes
  const oldSegment = oldBalance.gt(BigInt.zero())
    ? getSegmentIndex(oldPercentage)
    : -1;
  const newSegment = newBalance.gt(BigInt.zero())
    ? getSegmentIndex(newPercentage)
    : -1;

  // If segment hasn't changed and balances are the same, skip
  if (oldSegment == newSegment) {
    return;
  }

  // Load the state
  const tokenAddress = Address.fromBytes(token.id);
  const state = fetchTokenDistributionStatsState(tokenAddress);

  // Update holders count
  if (oldBalance.equals(BigInt.zero()) && newBalance.gt(BigInt.zero())) {
    state.holdersCount = state.holdersCount + 1;
  } else if (oldBalance.gt(BigInt.zero()) && newBalance.equals(BigInt.zero())) {
    state.holdersCount = state.holdersCount - 1;
  }

  // Calculate exact values if not provided
  const precision = BigInt.fromI32(10).pow(<u8>token.decimals);
  const oldExact = oldBalance.times(precision);
  const newExact = newBalance.times(precision);

  // Remove from old segment
  if (oldSegment >= 0) {
    updateSegmentStats(state, oldSegment, oldExact, token.decimals, false);
  }

  // Add to new segment
  if (newSegment >= 0) {
    updateSegmentStats(state, newSegment, newExact, token.decimals, true);
  }

  state.save();

  // Create timeseries entry
  trackTokenDistributionStats(token, state);
}

/**
 * Update segment statistics
 */
function updateSegmentStats(
  state: TokenDistributionStatsState,
  segment: i32,
  balance: BigInt,
  decimals: number,
  isAddition: boolean
): void {
  const countDelta = isAddition ? 1 : -1;

  if (segment == 0) {
    state.balancesCountSegment1 = state.balancesCountSegment1 + countDelta;
    const newTotalValueSegment1 = isAddition
      ? state.totalValueSegment1Exact.plus(balance)
      : state.totalValueSegment1Exact.minus(balance);
    setBigNumber(state, "totalValueSegment1", newTotalValueSegment1, decimals);
  } else if (segment == 1) {
    state.balancesCountSegment2 = state.balancesCountSegment2 + countDelta;
    const newTotalValueSegment2 = isAddition
      ? state.totalValueSegment2Exact.plus(balance)
      : state.totalValueSegment2Exact.minus(balance);
    setBigNumber(state, "totalValueSegment2", newTotalValueSegment2, decimals);
  } else if (segment == 2) {
    state.balancesCountSegment3 = state.balancesCountSegment3 + countDelta;
    const newTotalValueSegment3 = isAddition
      ? state.totalValueSegment3Exact.plus(balance)
      : state.totalValueSegment3Exact.minus(balance);
    setBigNumber(state, "totalValueSegment3", newTotalValueSegment3, decimals);
  } else if (segment == 3) {
    state.balancesCountSegment4 = state.balancesCountSegment4 + countDelta;
    const newTotalValueSegment4 = isAddition
      ? state.totalValueSegment4Exact.plus(balance)
      : state.totalValueSegment4Exact.minus(balance);
    setBigNumber(state, "totalValueSegment4", newTotalValueSegment4, decimals);
  } else if (segment == 4) {
    state.balancesCountSegment5 = state.balancesCountSegment5 + countDelta;
    const newTotalValueSegment5 = isAddition
      ? state.totalValueSegment5Exact.plus(balance)
      : state.totalValueSegment5Exact.minus(balance);
    setBigNumber(state, "totalValueSegment5", newTotalValueSegment5, decimals);
  }
}

/**
 * Track token distribution statistics in timeseries
 */
function trackTokenDistributionStats(
  token: Token,
  state: TokenDistributionStatsState
): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const distributionStats = new TokenDistributionStatsData(1);

  distributionStats.token = token.id;
  distributionStats.percentageOwnedByTop5Holders =
    state.percentageOwnedByTop5Holders;

  // Copy segment data from state
  distributionStats.balancesCountSegment1 = state.balancesCountSegment1;
  distributionStats.totalValueSegment1 = state.totalValueSegment1;
  distributionStats.totalValueSegment1Exact = state.totalValueSegment1Exact;

  distributionStats.balancesCountSegment2 = state.balancesCountSegment2;
  distributionStats.totalValueSegment2 = state.totalValueSegment2;
  distributionStats.totalValueSegment2Exact = state.totalValueSegment2Exact;

  distributionStats.balancesCountSegment3 = state.balancesCountSegment3;
  distributionStats.totalValueSegment3 = state.totalValueSegment3;
  distributionStats.totalValueSegment3Exact = state.totalValueSegment3Exact;

  distributionStats.balancesCountSegment4 = state.balancesCountSegment4;
  distributionStats.totalValueSegment4 = state.totalValueSegment4;
  distributionStats.totalValueSegment4Exact = state.totalValueSegment4Exact;

  distributionStats.balancesCountSegment5 = state.balancesCountSegment5;
  distributionStats.totalValueSegment5 = state.totalValueSegment5;
  distributionStats.totalValueSegment5Exact = state.totalValueSegment5Exact;

  distributionStats.save();
}

/**
 * Initialize distribution stats for a new token
 */
export function initializeTokenDistributionStats(token: Token): void {
  const tokenAddress = Address.fromBytes(token.id);
  const state = fetchTokenDistributionStatsState(tokenAddress);
  trackTokenDistributionStats(token, state);
}
