import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  store,
} from "@graphprotocol/graph-ts";
import {
  Account,
  Token,
  TokenDistributionStatsData,
  TokenDistributionStatsState,
  TokenTopHolder,
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
 * Initialize distribution stats for a new token
 */
export function initializeTokenDistributionStats(token: Token): void {
  const tokenAddress = Address.fromBytes(token.id);
  const state = fetchTokenDistributionStatsState(tokenAddress);
  trackTokenDistributionStats(token, state);
}

/**
 * Update token distribution stats when balance changes
 * This efficiently updates only the affected segments
 */
export function updateTokenDistributionStats(
  token: Token,
  account: Account,
  oldBalance: BigInt,
  newBalance: BigInt
): void {
  // Skip if balance hasn't changed
  if (oldBalance.equals(newBalance)) {
    return;
  }

  // Load the state
  const tokenAddress = Address.fromBytes(token.id);
  const state = fetchTokenDistributionStatsState(tokenAddress);

  const topHolders = state.topHolders.load();
  const topHolder = getTopHolderAtRank(topHolders, 1);
  const topBalance = topHolder ? topHolder.balanceExact : newBalance; // If no top holder, then this one is the first one and therefore the top one

  if (topBalance.equals(BigInt.zero())) {
    // Can't calculate percentages if there is no holder with a balance bigger than 0
    return;
  }

  // Calculate old and new percentages
  const oldPercentage = oldBalance.gt(BigInt.zero())
    ? oldBalance.times(BigInt.fromI32(100)).div(topBalance)
    : BigInt.zero();
  const newPercentage = newBalance.gt(BigInt.zero())
    ? newBalance.times(BigInt.fromI32(100)).div(topBalance)
    : BigInt.zero();

  // Determine segment changes
  const oldSegment = getSegmentIndex(oldPercentage);
  const newSegment = getSegmentIndex(newPercentage);

  // If segment hasn't changed and balances are the same, skip
  if (oldSegment == newSegment) {
    return;
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

  // Update top 5 holders
  updateTop5Holders(state, token, account, newBalance);

  // Update percentage owned by top 5 holders
  state.percentageOwnedByTop5Holders = calculateTop5HoldersPercentage(
    state,
    token
  );

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
 * Update top 5 holders,
 *
 * We will store the top 6, this way we can add a user if it exceeds the 5th place
 * and remove the 6th place user if it goes below the 6th place
 *
 * Simplified incremental approach using balance comparison
 */
function updateTop5Holders(
  state: TokenDistributionStatsState,
  token: Token,
  account: Account,
  newBalance: BigInt
): void {
  const tokenAddress = Address.fromBytes(token.id);
  const accountAddress = Address.fromBytes(account.id);

  // Create composite ID for TokenTopHolder (using Bytes)
  const topHolderId = tokenAddress.concat(accountAddress);

  const tokenHolder = fetchTokenTopHolder(topHolderId);
  if (!tokenHolder.state || !tokenHolder.account) {
    tokenHolder.state = state.id;
    tokenHolder.account = account.id;
    tokenHolder.save();
  }

  const topHolders = state.topHolders.load();
  const sixthPlaceHolder = getTopHolderAtRank(topHolders, 6);

  // Check if the new balance is greater than the 6th place holder, if not, we can skip
  const isTop6Holder =
    !sixthPlaceHolder || newBalance.gt(sixthPlaceHolder.balanceExact);
  if (!isTop6Holder) {
    store.remove("TokenTopHolder", topHolderId.toHexString());
    return;
  }

  setBigNumber(tokenHolder, "balance", newBalance, token.decimals);
  tokenHolder.save();

  updateTopHoldersRanks(state);
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
 * Calculate percentage owned by top 5 holders
 */
function calculateTop5HoldersPercentage(
  state: TokenDistributionStatsState,
  token: Token
): BigDecimal {
  if (token.totalSupplyExact.equals(BigInt.zero())) {
    return BigDecimal.zero();
  }

  let totalBalanceTopHolders = BigInt.zero();
  const topHolders = state.topHolders.load();
  for (let i = 0; i < topHolders.length; i++) {
    const topHolder = topHolders[i];
    if (topHolder.rank <= 5) {
      totalBalanceTopHolders = totalBalanceTopHolders.plus(
        topHolder.balanceExact
      );
    }
  }
  return totalBalanceTopHolders
    .times(BigInt.fromI32(100))
    .div(token.totalSupplyExact)
    .toBigDecimal();
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

function fetchTokenTopHolder(id: Bytes): TokenTopHolder {
  let topHolder = TokenTopHolder.load(id);

  if (!topHolder) {
    topHolder = new TokenTopHolder(id);
    topHolder.state = Bytes.empty();
    topHolder.account = Bytes.empty();
    setBigNumber(topHolder, "balance", BigInt.zero(), 0);
    topHolder.rank = 0;
    topHolder.save();
  }

  return topHolder;
}

function updateTopHoldersRanks(state: TokenDistributionStatsState): void {
  const topHolders = state.topHolders.load();

  // Sort by balance descending
  const sorted = topHolders.sort((a, b) => {
    if (a.balanceExact.gt(b.balanceExact)) return -1;
    if (a.balanceExact.lt(b.balanceExact)) return 1;
    return 0;
  });

  // Update ranks
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].rank = i + 1;
    sorted[i].save();
  }
}

function getTopHolderAtRank(
  topHolders: TokenTopHolder[],
  rank: number
): TokenTopHolder | null {
  let index = -1;
  for (let i = 0; i < topHolders.length; i++) {
    if (topHolders[i].rank == rank) {
      index = i;
      break;
    }
  }
  if (index == -1) {
    return null;
  }
  return topHolders[index];
}
