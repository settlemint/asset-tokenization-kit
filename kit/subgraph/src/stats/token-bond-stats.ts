import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenBondStatsData,
  TokenBondStatsState,
} from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchTokenBalance } from "../token-balance/fetch/token-balance";
import { fetchToken } from "../token/fetch/token";
import { setBigNumber } from "../utils/bignumber";

/**
 * Update token bond stats
 * @param token - The token to update stats for
 */
export function updateTokenBondStats(token: Token): void {
  // Only track stats for bond tokens
  if (!token.bond) {
    return;
  }

  const bond = fetchBond(Address.fromBytes(token.bond!));

  // Get denomination asset balance of the bond
  const denominationAsset = fetchToken(
    Address.fromBytes(bond.denominationAsset)
  );
  const bondAccount = fetchAccount(Address.fromBytes(token.account));
  const denominationAssetBalance = fetchTokenBalance(
    denominationAsset,
    bondAccount
  );
  const denominationAssetBalanceExact = denominationAssetBalance.valueExact;

  // Calculate required denomination asset balance
  // Required = totalSupply * faceValue
  const requiredBalanceExact = token.totalSupplyExact.times(
    bond.faceValueExact
  );

  // Update the persistent state entity
  const state = fetchTokenBondStatsState(Address.fromBytes(token.id));
  setBigNumber(
    state,
    "denominationAssetBalanceAvailable",
    denominationAssetBalanceExact,
    denominationAsset.decimals
  );
  setBigNumber(
    state,
    "denominationAssetBalanceRequired",
    requiredBalanceExact,
    denominationAsset.decimals
  );

  // Calculate covered percentage
  if (requiredBalanceExact.gt(BigInt.zero())) {
    state.coveredPercentage = denominationAssetBalanceExact
      .toBigDecimal()
      .div(requiredBalanceExact.toBigDecimal())
      .times(BigDecimal.fromString("100"));
  } else {
    state.coveredPercentage = BigDecimal.zero();
  }
  state.save();

  // Create timeseries entry
  trackTokenBondStats(state);
}

function trackTokenBondStats(state: TokenBondStatsState): void {
  // Create stats data entry for timeseries
  const statsData = new TokenBondStatsData(1);
  statsData.bond = state.bond;
  statsData.denominationAssetBalanceAvailable =
    state.denominationAssetBalanceAvailable;
  statsData.denominationAssetBalanceAvailableExact =
    state.denominationAssetBalanceAvailableExact;
  statsData.denominationAssetBalanceRequired =
    state.denominationAssetBalanceRequired;
  statsData.denominationAssetBalanceRequiredExact =
    state.denominationAssetBalanceRequiredExact;
  statsData.coveredPercentage = state.coveredPercentage;
  statsData.save();
}

/**
 * Fetch or create TokenBondStatsState entity
 */
function fetchTokenBondStatsState(tokenAddress: Address): TokenBondStatsState {
  let state = TokenBondStatsState.load(tokenAddress);

  if (!state) {
    const bond = fetchBond(tokenAddress);
    state = new TokenBondStatsState(tokenAddress);
    state.bond = bond.id;
    state.denominationAssetBalanceAvailable = BigDecimal.zero();
    state.denominationAssetBalanceAvailableExact = BigInt.zero();
    state.denominationAssetBalanceRequired = BigDecimal.zero();
    state.denominationAssetBalanceRequiredExact = BigInt.zero();
    state.coveredPercentage = BigDecimal.zero();
    state.save();
  }

  return state;
}
