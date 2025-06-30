import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import {
  Account,
  AccountStatsData,
  AccountStatsState,
  Token,
  TokenBalance,
} from "../../generated/schema";
import { getTokenBasePrice } from "./system-stats";
import { fetchAccount } from "../account/fetch/account";

/**
 * Update account stats when token balance changes (transfer/mint/burn)
 * This calculates the delta and updates the total
 */
export function updateAccountStatsForBalanceChange(
  accountAddress: Address,
  token: Token,
  balanceDelta: BigDecimal,
  oldBalanceCount: i32,
  newBalanceCount: i32,
  timestamp: BigInt
): void {
  const state = fetchAccountStatsState(accountAddress);
  const basePrice = getTokenBasePrice(token.basePriceClaim);

  // Calculate value delta = balanceDelta * basePrice
  const valueDelta = balanceDelta.times(basePrice);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  // Update balance count
  state.balancesCount = state.balancesCount + (newBalanceCount - oldBalanceCount);
  
  state.lastUpdatedAt = timestamp;
  state.save();

  // Create timeseries entry
  trackAccountStats(
    accountAddress,
    state.totalValueInBaseCurrency,
    state.balancesCount
  );
}

/**
 * Update account stats when base price changes
 * This recalculates the value difference for accounts holding the token
 */
export function updateAccountStatsForPriceChange(
  accountAddress: Address,
  tokenBalance: TokenBalance,
  oldPrice: BigDecimal,
  newPrice: BigDecimal,
  timestamp: BigInt
): void {
  const state = fetchAccountStatsState(accountAddress);

  // Calculate value delta
  const oldValue = oldPrice.times(tokenBalance.value);
  const newValue = newPrice.times(tokenBalance.value);
  const valueDelta = newValue.minus(oldValue);

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  log.info(
    "updateAccountStatsForPriceChange: account {}, token {}, oldPrice {}, newPrice {}, balance {}, valueDelta {}",
    [
      accountAddress.toHexString(),
      tokenBalance.token.toHexString(),
      oldPrice.toString(),
      newPrice.toString(),
      tokenBalance.value.toString(),
      valueDelta.toString(),
    ]
  );

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);
  state.lastUpdatedAt = timestamp;
  state.save();

  // Create timeseries entry
  trackAccountStats(
    accountAddress,
    state.totalValueInBaseCurrency,
    state.balancesCount
  );
}

/**
 * Fetch or create AccountStatsState entity
 */
function fetchAccountStatsState(accountAddress: Address): AccountStatsState {
  let state = AccountStatsState.load(accountAddress);

  if (!state) {
    state = new AccountStatsState(accountAddress);
    state.account = fetchAccount(accountAddress).id;
    state.totalValueInBaseCurrency = BigDecimal.zero();
    state.balancesCount = 0;
    state.lastUpdatedAt = BigInt.zero();
    state.save();
  }

  return state;
}

/**
 * Track account statistics in timeseries
 */
function trackAccountStats(
  accountAddress: Address,
  totalValue: BigDecimal,
  balancesCount: i32
): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const accountStats = new AccountStatsData(1);

  accountStats.account = fetchAccount(accountAddress).id;
  accountStats.totalValueInBaseCurrency = totalValue;
  accountStats.balancesCount = balancesCount;

  accountStats.save();
}