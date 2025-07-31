import { Address, BigDecimal, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenTypeStatsData,
  TokenTypeStatsState,
} from "../../generated/schema";
import { fetchSystem } from "../system/fetch/system";
import { getSystemAddress, getTokenBasePrice } from "./utils/stats-utils";

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
  const basePrice = getTokenBasePrice(token.basePriceClaim);
  const initialValue = token.totalSupply.times(basePrice);
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
  const basePrice = getTokenBasePrice(token.basePriceClaim);
  const valueDelta = supplyDelta.times(basePrice);

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
  const system = getSystemAddress(token);
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
  const percentage = totalValueInBaseCurrency.div(
    totalSystemValueInBaseCurrency
  );
  log.info(
    "totalValueInBaseCurrency: {}, totalSystemValueInBaseCurrency: {}, percentage: {}",
    [
      totalValueInBaseCurrency.toString(),
      totalSystemValueInBaseCurrency.toString(),
      percentage.toString(),
    ]
  );
  return percentage.times(BigDecimal.fromString("100"));
}
