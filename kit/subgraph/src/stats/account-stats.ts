import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import {
  AccountStatsData,
  AccountStatsState,
  Token,
  TokenBalance,
} from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";
import { fetchToken } from "../token/fetch/token";
import { getTokenBasePrice } from "../token/utils/token-utils";

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

  // Create timeseries entry
  trackAccountStats(
    accountAddress,
    state.totalValueInBaseCurrency,
    state.balancesCount
  );
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

  // Create timeseries entry
  trackAccountStats(
    accountAddress,
    state.totalValueInBaseCurrency,
    state.balancesCount
  );
}

/**
 * Update account stats when token balance changes (transfer/mint/burn)
 * This calculates the delta and updates the total
 */
export function updateAccountStatsForBalanceChange(
  accountAddress: Address,
  token: Token,
  balanceDelta: BigDecimal
): void {
  const state = fetchAccountStatsState(accountAddress);
  const basePrice = getTokenBasePrice(token.basePriceClaim);

  // Calculate value delta = balanceDelta * basePrice
  const valueDelta = balanceDelta.times(basePrice);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

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
  newPrice: BigDecimal
): void {
  const state = fetchAccountStatsState(accountAddress);

  // Calculate value delta
  const oldValue = oldPrice.times(tokenBalance.value);
  const newValue = newPrice.times(tokenBalance.value);
  let valueDelta = newValue.minus(oldValue);

  // Check if the token is a denomination asset for a bond
  // For bonds the value equals the face value times the price of the denomination asset
  const token = fetchToken(Address.fromBytes(tokenBalance.token));
  const bonds = token.denominationAssetForBond.load();
  for (let i = 0; i < bonds.length; i++) {
    const bondToken = fetchToken(Address.fromBytes(bonds[i].id));
    const oldValueBond = oldPrice
      .times(bonds[i].faceValue)
      .times(bondToken.totalSupply);
    const newValueBond = newPrice
      .times(bonds[i].faceValue)
      .times(bondToken.totalSupply);
    const valueDeltaBond = newValueBond.minus(oldValueBond);
    valueDelta = valueDelta.plus(valueDeltaBond);
  }

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

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
