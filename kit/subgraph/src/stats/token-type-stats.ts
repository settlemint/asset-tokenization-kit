import { Address, BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenFactory,
  TokenFactoryRegistry,
  TokenTypeStatsData,
  TokenTypeStatsState,
} from "../../generated/schema";
import { fetchSystem } from "../system/fetch/system";
import { getTokenBasePrice } from "./system-stats";

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
    state,
    totalSystemValueInBaseCurrency
  );
  state.save();

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
    state,
    totalSystemValueInBaseCurrency
  );
  state.save();

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
  tokenTypeStats.count = state.count;
  tokenTypeStats.percentageOfTotalSupply = state.percentageOfTotalSupply;
  tokenTypeStats.save();
}

/**
 * Get percentage of total supply
 */
function getPercentageOfTotalSupply(
  state: TokenTypeStatsState,
  totalSystemValueInBaseCurrency: BigDecimal
): BigDecimal {
  return state.totalValueInBaseCurrency
    .times(BigDecimal.fromString("100"))
    .div(totalSystemValueInBaseCurrency);
}

/**
 * Get the system address from a token
 * This is a helper function similar to the one in system-stats.ts
 */
function getSystemAddress(token: Token): Address {
  if (!token.tokenFactory) {
    return Address.zero();
  }

  const tokenFactory = TokenFactory.load(token.tokenFactory!);
  if (!tokenFactory) {
    return Address.zero();
  }

  if (!tokenFactory.tokenFactoryRegistry) {
    return Address.zero();
  }

  const tokenFactoryRegistry = TokenFactoryRegistry.load(
    tokenFactory.tokenFactoryRegistry!
  );
  if (!tokenFactoryRegistry) {
    return Address.zero();
  }

  return Address.fromBytes(tokenFactoryRegistry.system);
}
