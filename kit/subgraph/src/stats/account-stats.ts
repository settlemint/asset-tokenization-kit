import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  AccountStatsData,
  AccountStatsState,
  Token,
  TokenBalance,
} from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchToken } from "../token/fetch/token";
import { getTokenBasePrice } from "../token/utils/token-utils";
import { toBigDecimal } from "../utils/token-decimals";

/**
 * Increase the balance count for an account
 * @param accountAddress - The address of the account to increase the balance count for
 */
export function increaseAccountStatsBalanceCount(
  accountAddress: Address
): void {
  const state = fetchAccountStatsState(accountAddress);
  state.balancesCount = state.balancesCount + 1;
  state.save();

  trackAccountStats(state);
}

/**
 * Decrease the balance count for an account
 * @param accountAddress - The address of the account to decrease the balance count for
 */
export function decreaseAccountStatsBalanceCount(
  accountAddress: Address
): void {
  const state = fetchAccountStatsState(accountAddress);
  state.balancesCount = state.balancesCount - 1;
  state.save();

  trackAccountStats(state);
}

/**
 * Update account stats when token balance changes (transfer/mint/burn)
 * This calculates the delta and updates the total
 */
export function updateAccountStatsForBalanceChange(
  accountAddress: Address,
  token: Token,
  balanceDeltaExact: BigInt
): void {
  if (balanceDeltaExact.equals(BigInt.zero())) {
    return;
  }

  const state = fetchAccountStatsState(accountAddress);
  const balanceDelta = toBigDecimal(balanceDeltaExact, token.decimals);

  state.totalValueExact = state.totalValueExact.plus(balanceDeltaExact);
  state.totalValue = state.totalValue.plus(balanceDelta);
  state.totalAvailableExact =
    state.totalAvailableExact.plus(balanceDeltaExact);
  state.totalAvailable = state.totalAvailable.plus(balanceDelta);

  let valueDelta = BigDecimal.zero();

  // For bonds the value delta equals the face value times the price of the denomination asset
  if (token.bond) {
    const bond = fetchBond(Address.fromBytes(token.bond!));
    const denominationAsset = fetchToken(
      Address.fromBytes(bond.denominationAsset)
    );
    const basePrice = getTokenBasePrice(denominationAsset.basePriceClaim);
    valueDelta = balanceDelta.times(bond.faceValue).times(basePrice);
  } else {
    const basePrice = getTokenBasePrice(token.basePriceClaim);
    valueDelta = balanceDelta.times(basePrice);
  }

  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.save();

  trackAccountStats(state);
}

export function updateAccountStatsForTokensFrozen(
  accountAddress: Address,
  token: Token,
  frozenDeltaExact: BigInt
): void {
  if (frozenDeltaExact.equals(BigInt.zero())) {
    return;
  }

  const state = fetchAccountStatsState(accountAddress);
  const frozenDelta = toBigDecimal(frozenDeltaExact, token.decimals);

  state.totalFrozenExact = state.totalFrozenExact.plus(frozenDeltaExact);
  state.totalFrozen = state.totalFrozen.plus(frozenDelta);
  state.totalAvailableExact =
    state.totalAvailableExact.minus(frozenDeltaExact);
  state.totalAvailable = state.totalAvailable.minus(frozenDelta);

  state.save();

  trackAccountStats(state);
}

/**
 * Update account stats when base price changes
 * This recalculates the value difference for accounts holding the token
 */
export function updateAccountStatsForPriceChange(
  accountAddress: Address,
  tokenBalance: TokenBalance,
  oldPrice: BigDecimal,
  newPrice: BigDecimal
): void {
  const state = fetchAccountStatsState(accountAddress);

  // Calculate value delta
  const oldValue = oldPrice.times(tokenBalance.value);
  const newValue = newPrice.times(tokenBalance.value);
  const valueDelta = newValue.minus(oldValue);

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.save();

  // Create timeseries entry
  trackAccountStats(state);
}

/**
 * Fetch or create AccountStatsState entity
 */
function fetchAccountStatsState(accountAddress: Address): AccountStatsState {
  let state = AccountStatsState.load(accountAddress);

  if (!state) {
    state = new AccountStatsState(accountAddress);
    state.account = fetchAccount(accountAddress).id;
    state.totalValue = BigDecimal.zero();
    state.totalValueExact = BigInt.zero();
    state.totalFrozen = BigDecimal.zero();
    state.totalFrozenExact = BigInt.zero();
    state.totalAvailable = BigDecimal.zero();
    state.totalAvailableExact = BigInt.zero();
    state.totalValueInBaseCurrency = BigDecimal.zero();
    state.balancesCount = 0;
    state.save();
  }

  return state;
}

/**
 * Track account statistics in timeseries
 */
export function trackAccountStats(state: AccountStatsState): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const accountStats = new AccountStatsData(1);

  accountStats.account = state.account;
  accountStats.totalValue = state.totalValue;
  accountStats.totalValueExact = state.totalValueExact;
  accountStats.totalFrozen = state.totalFrozen;
  accountStats.totalFrozenExact = state.totalFrozenExact;
  accountStats.totalAvailable = state.totalAvailable;
  accountStats.totalAvailableExact = state.totalAvailableExact;
  accountStats.totalValueInBaseCurrency = state.totalValueInBaseCurrency;
  accountStats.balancesCount = state.balancesCount;

  accountStats.save();
}
