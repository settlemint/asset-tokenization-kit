import { Address, BigDecimal, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenTypeStatsData,
  TokenTypeStatsState,
} from "../../generated/schema";
import { fetchSystem } from "../system/fetch/system";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchToken } from "../token/fetch/token";
import {
  getTokenBasePrice,
  getTokenSystemAddress,
} from "../token/utils/token-utils";

/**
 * State management for token type statistics
 * Tracks counts and percentages by token type efficiently using delta updates
 */

/**
 * Update token type stats when a new token is created
 */
export function updateTokenTypeStatsForTokenCreation(token: Token): void {
  const state = fetchTokenTypeStatsState(token);

  // Increment count
  state.count = state.count + 1;

  // Add initial value (0 if no supply yet)
  let initialValue = BigDecimal.zero();
  // For bonds the value equals the face value times the price of the denomination asset
  if (token.bond) {
    const bond = fetchBond(Address.fromBytes(token.bond!));
    if (bond.denominationAsset == Address.zero()) {
      // Return early if the denomination asset is not set
      // handleBondCreated sets the denomination asset and will trigger this function again
      return;
    }
    const denominationAsset = fetchToken(
      Address.fromBytes(bond.denominationAsset)
    );
    const basePrice = getTokenBasePrice(denominationAsset.basePriceClaim);
    initialValue = token.totalSupply.times(bond.faceValue).times(basePrice);
  } else {
    const basePrice = getTokenBasePrice(token.basePriceClaim);
    initialValue = token.totalSupply.times(basePrice);
  }

  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(initialValue);

  state.save();

  // Track in timeseries
  trackTokenTypeStats(state);
}

/**
 * Update token type stats when token supply changes (mint/burn)
 * This uses delta updates to avoid expensive recalculations
 */
export function updateTokenTypeStatsForSupplyChange(
  totalSystemValueInBaseCurrency: BigDecimal,
  token: Token,
  supplyDelta: BigDecimal
): void {
  let valueDelta = BigDecimal.zero();

  // For bonds the value delta equals the face value times the price of the denomination asset
  if (token.bond) {
    const bond = fetchBond(Address.fromBytes(token.bond!));
    const denominationAsset = fetchToken(
      Address.fromBytes(bond.denominationAsset)
    );
    const basePrice = getTokenBasePrice(denominationAsset.basePriceClaim);
    valueDelta = supplyDelta.times(bond.faceValue).times(basePrice);
  } else {
    const basePrice = getTokenBasePrice(token.basePriceClaim);
    valueDelta = supplyDelta.times(basePrice);
  }

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  const state = fetchTokenTypeStatsState(token);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.percentageOfTotalSupply = getPercentageOfTotalSupply(
    state.totalValueInBaseCurrency,
    totalSystemValueInBaseCurrency
  );
  state.save();

  // Update the percentage of total supply for all other token types in the system
  updateTotalSupplyPercentageForOtherTypes(
    state,
    totalSystemValueInBaseCurrency
  );

  // Track in timeseries
  trackTokenTypeStats(state);
}

/**
 * Update token type stats when base price changes
 * This recalculates the value difference for tokens of this type
 */
export function updateTokenTypeStatsForPriceChange(
  totalSystemValueInBaseCurrency: BigDecimal,
  token: Token,
  oldPrice: BigDecimal,
  newPrice: BigDecimal
): void {
  // Ignore bonds as there value is tracked by its denomination asset
  if (token.bond) {
    return;
  }

  // Check if the token is a denomination asset for a bond
  // For bonds the value equals the face value times the price of the denomination asset
  const bonds = token.denominationAssetForBond.load();
  let valueDeltaBonds = BigDecimal.zero();
  for (let i = 0; i < bonds.length; i++) {
    const bondToken = fetchToken(Address.fromBytes(bonds[i].id));
    const newPriceBond = newPrice.times(bonds[i].faceValue);
    const oldPriceBond = oldPrice.times(bonds[i].faceValue);
    const valueDeltaBond = newPriceBond
      .minus(oldPriceBond)
      .times(bondToken.totalSupply);
    valueDeltaBonds = valueDeltaBonds.plus(valueDeltaBond);
  }
  if (!valueDeltaBonds.equals(BigDecimal.zero())) {
    const bondToken = fetchToken(Address.fromBytes(bonds[0].id));
    const stateForBond = fetchTokenTypeStatsState(bondToken);
    stateForBond.totalValueInBaseCurrency =
      stateForBond.totalValueInBaseCurrency.plus(valueDeltaBonds);
    stateForBond.percentageOfTotalSupply = getPercentageOfTotalSupply(
      stateForBond.totalValueInBaseCurrency,
      totalSystemValueInBaseCurrency
    );
    stateForBond.save();

    // Update the percentage of total supply for all other token types in the system
    updateTotalSupplyPercentageForOtherTypes(
      stateForBond,
      totalSystemValueInBaseCurrency
    );

    // Track in timeseries
    trackTokenTypeStats(stateForBond);
  }

  const valueDelta = newPrice.minus(oldPrice).times(token.totalSupply);

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  const state = fetchTokenTypeStatsState(token);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.percentageOfTotalSupply = getPercentageOfTotalSupply(
    state.totalValueInBaseCurrency,
    totalSystemValueInBaseCurrency
  );
  state.save();

  // Update the percentage of total supply for all other token types in the system
  updateTotalSupplyPercentageForOtherTypes(
    state,
    totalSystemValueInBaseCurrency
  );

  // Track in timeseries
  trackTokenTypeStats(state);
}

/**
 * Fetch or create TokenTypeStatsState
 */
function fetchTokenTypeStatsState(token: Token): TokenTypeStatsState {
  const system = getTokenSystemAddress(token);
  const id = system.concat(Bytes.fromUTF8(token.type));
  let state = TokenTypeStatsState.load(id);

  if (!state) {
    state = new TokenTypeStatsState(id);
    state.totalValueInBaseCurrency = BigDecimal.zero();
    state.system = fetchSystem(system).id;
    state.count = 0;
    state.type = token.type;
    state.percentageOfTotalSupply = BigDecimal.zero();
    state.save();
  }

  return state;
}

/**
 * Track token type statistics in timeseries
 * This calculates percentage of total supply value
 */
function trackTokenTypeStats(state: TokenTypeStatsState): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const tokenTypeStats = new TokenTypeStatsData(1);
  tokenTypeStats.type = state.type;
  tokenTypeStats.system = state.system;
  tokenTypeStats.count = state.count;
  tokenTypeStats.percentageOfTotalSupply = state.percentageOfTotalSupply;
  tokenTypeStats.save();
}

/**
 * Update the percentage of total supply for all other token types in the system.
 * This function recalculates and updates the percentageOfTotalSupply field
 * for every token type except the one provided in `state`.
 *
 * @param state - The TokenTypeStatsState instance that was just updated
 * @param totalSystemValueInBaseCurrency - The new total value in base currency for the system
 */
function updateTotalSupplyPercentageForOtherTypes(
  state: TokenTypeStatsState,
  totalSystemValueInBaseCurrency: BigDecimal
): void {
  const system = fetchSystem(Address.fromBytes(state.system));
  const tokenTypeStats = system.tokenTypeStats.load();
  for (let i = 0; i < tokenTypeStats.length; i++) {
    const tokenTypeStat = tokenTypeStats[i];
    if (tokenTypeStat.type != state.type) {
      tokenTypeStat.percentageOfTotalSupply = getPercentageOfTotalSupply(
        tokenTypeStat.totalValueInBaseCurrency,
        totalSystemValueInBaseCurrency
      );
      tokenTypeStat.save();
    }
  }
}

/**
 * Get percentage of total supply
 */
function getPercentageOfTotalSupply(
  totalValueInBaseCurrency: BigDecimal,
  totalSystemValueInBaseCurrency: BigDecimal
): BigDecimal {
  if (totalSystemValueInBaseCurrency.le(BigDecimal.zero())) {
    log.info(
      "Skipping percentage calculation due to non-positive total system value: {}",
      [totalSystemValueInBaseCurrency.toString()]
    );
    return BigDecimal.zero();
  }

  const percentage = totalValueInBaseCurrency
    .div(totalSystemValueInBaseCurrency)
    .times(BigDecimal.fromString("100"));

  log.info(
    "totalValueInBaseCurrency: {}, totalSystemValueInBaseCurrency: {}, percentage: {}",
    [
      totalValueInBaseCurrency.toString(),
      totalSystemValueInBaseCurrency.toString(),
      percentage.toString(),
    ]
  );

  return percentage;
}
