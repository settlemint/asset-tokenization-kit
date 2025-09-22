import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  AccountStatsData,
  AccountStatsState,
  AccountSystemStatsData,
  AccountSystemStatsState,
  Token,
  TokenBalance,
} from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";
import { fetchSystem } from "../system/fetch/system";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchToken } from "../token/fetch/token";
import {
  getTokenBasePrice,
  getTokenSystemAddress,
} from "../token/utils/token-utils";
import { toBigDecimal } from "../utils/token-decimals";

/**
 * Increase the balance count for an account
 * @param accountAddress - The address of the account to increase the balance count for
 * @param token - Token used to determine the system scope
 */
export function increaseAccountStatsBalanceCount(
  accountAddress: Address,
  token: Token
): void {
  const state = fetchAccountStatsState(accountAddress);
  const systemState = fetchAccountSystemStatsState(
    accountAddress,
    getTokenSystemAddress(token)
  );

  state.balancesCount = state.balancesCount + 1;
  systemState.balancesCount = systemState.balancesCount + 1;

  state.save();
  systemState.save();

  trackAccountStats(state);
  trackAccountSystemStats(systemState);
}

/**
 * Decrease the balance count for an account
 * @param accountAddress - The address of the account to decrease the balance count for
 * @param token - Token used to determine the system scope
 */
export function decreaseAccountStatsBalanceCount(
  accountAddress: Address,
  token: Token
): void {
  const state = fetchAccountStatsState(accountAddress);
  const systemState = fetchAccountSystemStatsState(
    accountAddress,
    getTokenSystemAddress(token)
  );

  state.balancesCount = state.balancesCount - 1;
  systemState.balancesCount = systemState.balancesCount - 1;

  state.save();
  systemState.save();

  trackAccountStats(state);
  trackAccountSystemStats(systemState);
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
  const systemState = fetchAccountSystemStatsState(
    accountAddress,
    getTokenSystemAddress(token)
  );
  const balanceDelta = toBigDecimal(balanceDeltaExact, token.decimals);

  state.totalValueExact = state.totalValueExact.plus(balanceDeltaExact);
  state.totalValue = state.totalValue.plus(balanceDelta);
  state.totalAvailableExact = state.totalAvailableExact.plus(balanceDeltaExact);
  state.totalAvailable = state.totalAvailable.plus(balanceDelta);

  systemState.totalValueExact =
    systemState.totalValueExact.plus(balanceDeltaExact);
  systemState.totalValue = systemState.totalValue.plus(balanceDelta);
  systemState.totalAvailableExact =
    systemState.totalAvailableExact.plus(balanceDeltaExact);
  systemState.totalAvailable = systemState.totalAvailable.plus(balanceDelta);

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

  systemState.totalValueInBaseCurrency =
    systemState.totalValueInBaseCurrency.plus(valueDelta);

  state.save();
  systemState.save();

  trackAccountStats(state);
  trackAccountSystemStats(systemState);
}

export function updateAccountStatsForTokensFrozen(
  accountAddress: Address,
  token: Token,
  frozenDeltaExact: BigInt
): void {
  if (frozenDeltaExact.equals(BigInt.zero())) {
    return;
  }
  const systemAddress = getTokenSystemAddress(token);

  const state = fetchAccountStatsState(accountAddress);
  const systemState = fetchAccountSystemStatsState(
    accountAddress,
    systemAddress
  );
  const frozenDelta = toBigDecimal(frozenDeltaExact, token.decimals);

  state.totalFrozenExact = state.totalFrozenExact.plus(frozenDeltaExact);
  state.totalFrozen = state.totalFrozen.plus(frozenDelta);
  state.totalAvailableExact = state.totalAvailableExact.minus(frozenDeltaExact);
  state.totalAvailable = state.totalAvailable.minus(frozenDelta);

  systemState.totalFrozenExact =
    systemState.totalFrozenExact.plus(frozenDeltaExact);
  systemState.totalFrozen = systemState.totalFrozen.plus(frozenDelta);
  systemState.totalAvailableExact =
    systemState.totalAvailableExact.minus(frozenDeltaExact);
  systemState.totalAvailable = systemState.totalAvailable.minus(frozenDelta);

  state.save();
  systemState.save();

  trackAccountStats(state);
  trackAccountSystemStats(systemState);
}

/**
 * Update account stats when base price changes
 * This recalculates the value difference for accounts holding the token
 */
export function updateAccountStatsForPriceChange(
  accountAddress: Address,
  token: Token,
  tokenBalance: TokenBalance,
  oldPrice: BigDecimal,
  newPrice: BigDecimal
): void {
  // Calculate value delta
  const oldValue = oldPrice.times(tokenBalance.value);
  const newValue = newPrice.times(tokenBalance.value);
  const valueDelta = newValue.minus(oldValue);

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  const state = fetchAccountStatsState(accountAddress);
  const systemState = fetchAccountSystemStatsState(
    accountAddress,
    getTokenSystemAddress(token)
  );

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  systemState.totalValueInBaseCurrency =
    systemState.totalValueInBaseCurrency.plus(valueDelta);

  state.save();
  systemState.save();

  // Create timeseries entry
  trackAccountStats(state);
  trackAccountSystemStats(systemState);
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

function fetchAccountSystemStatsState(
  accountAddress: Address,
  systemAddress: Address
): AccountSystemStatsState {
  const id = accountAddress.concat(systemAddress);
  let state = AccountSystemStatsState.load(id);
  if (!state) {
    state = new AccountSystemStatsState(id);
    state.account = fetchAccount(accountAddress).id;
    state.system = fetchSystem(systemAddress).id;
    state.totalValue = BigDecimal.zero();
    state.totalValueExact = BigInt.zero();
    state.totalFrozen = BigDecimal.zero();
    state.totalFrozenExact = BigInt.zero();
    state.totalAvailable = BigDecimal.zero();
    state.totalAvailableExact = BigInt.zero();
    state.totalValueInBaseCurrency = BigDecimal.zero();
    state.balancesCount = 0;
  }
  return state;
}

/**
 * Track account statistics in timeseries
 */
function trackAccountStats(state: AccountStatsState): void {
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

function trackAccountSystemStats(state: AccountSystemStatsState): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const accountSystemStats = new AccountSystemStatsData(1);
  accountSystemStats.account = state.account;
  accountSystemStats.system = state.system;
  accountSystemStats.totalValue = state.totalValue;
  accountSystemStats.totalValueExact = state.totalValueExact;
  accountSystemStats.totalFrozen = state.totalFrozen;
  accountSystemStats.totalFrozenExact = state.totalFrozenExact;
  accountSystemStats.totalAvailable = state.totalAvailable;
  accountSystemStats.totalAvailableExact = state.totalAvailableExact;
  accountSystemStats.totalValueInBaseCurrency = state.totalValueInBaseCurrency;
  accountSystemStats.balancesCount = state.balancesCount;
  accountSystemStats.save();
}
