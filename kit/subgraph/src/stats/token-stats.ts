import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Event,
  Token,
  TokenStatsData,
  TokenStatsState,
} from "../../generated/schema";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { TokenExtension } from "../token-extensions/utils/token-extensions-utils";
import { fetchToken } from "../token/fetch/token";
import { getTokenBasePrice } from "../token/utils/token-utils";
import { setBigNumber } from "../utils/bignumber";

/**
 * Increase the balance count for a token
 * @param tokenAddress - The address of the token to increase the balance count for
 */
export function increaseTokenStatsBalanceCount(tokenAddress: Address): void {
  const state = fetchTokenStatsState(tokenAddress);
  state.balancesCount = state.balancesCount + 1;
  state.save();

  // Create timeseries entry
  const data = createTokenStatsData(state);
  data.save();
}

/**
 * Decrease the balance count for a token
 * @param tokenAddress - The address of the token to decrease the balance count for
 */
export function decreaseTokenStatsBalanceCount(tokenAddress: Address): void {
  const state = fetchTokenStatsState(tokenAddress);
  state.balancesCount = state.balancesCount - 1;
  state.save();

  // Create timeseries entry
  const data = createTokenStatsData(state);
  data.save();
}

/**
 * Update token stats for total value in base currency
 * @param token - The token to update stats for
 */
export function updateTokenStatsTotalValueInBaseCurrency(token: Token): void {
  const state = fetchTokenStatsState(Address.fromBytes(token.id));

  // For bonds the value equals the face value times the price of the denomination asset
  if (token.extensions.includes(TokenExtension.BOND)) {
    const bond = fetchBond(token.id);
    const denominationAsset = fetchToken(bond.denominationAsset);
    const basePrice = getTokenBasePrice(denominationAsset.basePriceClaim);
    const totalValueInBaseCurrency = token.totalSupply
      .times(bond.faceValue)
      .times(basePrice);
    state.totalValueInBaseCurrency = totalValueInBaseCurrency;
    state.save();
  } else {
    const basePrice = getTokenBasePrice(token.basePriceClaim);
    const totalValueInBaseCurrency = token.totalSupply.times(basePrice);
    state.totalValueInBaseCurrency = totalValueInBaseCurrency;
    state.save();

    // Make sure to update the value for all denomination assets for bonds
    const bonds = token.denominationAssetForBond.load();
    for (let i = 0; i < bonds.length; i++) {
      const bondState = fetchTokenStatsState(Address.fromBytes(bonds[i].id));
      const denominationAsset = fetchToken(bonds[i].id);
      const basePrice = getTokenBasePrice(denominationAsset.basePriceClaim);
      const totalValueInBaseCurrency = token.totalSupply
        .times(bonds[i].faceValue)
        .times(basePrice);
      bondState.totalValueInBaseCurrency = state.totalValueInBaseCurrency.plus(
        totalValueInBaseCurrency
      );
      if (
        totalValueInBaseCurrency.notEqual(bondState.totalValueInBaseCurrency)
      ) {
        bondState.save();
      }
    }
  }
}

/**
 * Track token statistics for a given event
 * @param token - The token to track statistics for
 * @param amount - The amount of the event
 */
export function trackTokenStats(token: Token, event: Event): void {
  const state = fetchTokenStatsState(Address.fromBytes(token.id));

  const data = createTokenStatsData(state);
  const eventValues = event.values.load();
  const amountIndex = eventValues.findIndex((entry) => entry.name == "amount");
  const amount = amountIndex >= 0 ? eventValues[amountIndex] : null;
  if (!amount) {
    log.error("Failed to track token stats for event {}, no amount found", [
      event.eventName,
    ]);
    return;
  }
  const amountValue = BigInt.fromString(amount.value);

  if (event.eventName == "MintCompleted") {
    setBigNumber(data, "minted", amountValue, token.decimals);
  } else if (event.eventName == "BurnCompleted") {
    setBigNumber(data, "burned", amountValue, token.decimals);
  } else if (
    event.eventName == "TransferCompleted" ||
    event.eventName == "ForcedTransfer"
  ) {
    setBigNumber(data, "transferred", amountValue, token.decimals);
  } else {
    log.error("Failed to track token stats for unknown event: {}", [
      event.eventName,
    ]);
  }

  data.save();
}

/**
 * Fetch or create TokenStatsState entity
 */
export function fetchTokenStatsState(tokenAddress: Address): TokenStatsState {
  let state = TokenStatsState.load(tokenAddress);

  if (!state) {
    const token = fetchToken(tokenAddress);
    state = new TokenStatsState(tokenAddress);
    state.token = token.id;
    state.balancesCount = 0;
    state.totalValueInBaseCurrency = BigDecimal.zero();

    state.save();
  }

  return state;
}

/**
 * Create a new TokenStatsData entity
 * @param state - The TokenStatsState entity
 * @returns The new TokenStatsData entity
 */
function createTokenStatsData(state: TokenStatsState): TokenStatsData {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const tokenStats = new TokenStatsData(1);

  const token = fetchToken(Address.fromBytes(state.token));
  tokenStats.token = state.token;
  tokenStats.type = token.type;
  tokenStats.balancesCount = state.balancesCount;
  setBigNumber(
    tokenStats,
    "totalSupply",
    token.totalSupplyExact,
    token.decimals
  );
  setBigNumber(tokenStats, "minted", BigInt.zero(), token.decimals);
  setBigNumber(tokenStats, "burned", BigInt.zero(), token.decimals);
  setBigNumber(tokenStats, "transferred", BigInt.zero(), token.decimals);
  const basePrice = getTokenBasePrice(token.basePriceClaim);
  tokenStats.totalValueInBaseCurrency = token.totalSupply.times(basePrice);

  return tokenStats;
}
