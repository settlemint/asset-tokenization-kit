import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import {
  SystemStatsState,
  Token,
  TokenFactory,
  TokenFactoryRegistry,
  TokenTypeStatsData,
  TokenTypeStatsState,
} from "../../generated/schema";
import { getTokenBasePrice } from "./system-stats";

/**
 * State management for token type statistics
 * Tracks counts and percentages by token type efficiently using delta updates
 */

/**
 * Update token type stats when a new token is created
 */
export function updateTokenTypeStatsForTokenCreation(token: Token): void {
  const state = fetchTokenTypeStatsState(token.type);

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
  token: Token,
  supplyDelta: BigDecimal
): void {
  const basePrice = getTokenBasePrice(token.basePriceClaim);
  const valueDelta = supplyDelta.times(basePrice);

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  const state = fetchTokenTypeStatsState(token.type);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.save();

  // Track in timeseries
  trackTokenTypeStats(state);
}

/**
 * Update token type stats when base price changes
 * This recalculates the value difference for tokens of this type
 */
export function updateTokenTypeStatsForPriceChange(
  token: Token,
  oldPrice: BigDecimal,
  newPrice: BigDecimal
): void {
  const valueDelta = newPrice.minus(oldPrice).times(token.totalSupply);

  if (valueDelta.equals(BigDecimal.zero())) {
    return;
  }

  const state = fetchTokenTypeStatsState(token.type);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.save();

  // Track in timeseries
  trackTokenTypeStats(state);
}

/**
 * Fetch or create TokenTypeStatsState
 */
function fetchTokenTypeStatsState(tokenType: string): TokenTypeStatsState {
  let state = TokenTypeStatsState.load(tokenType);

  if (!state) {
    state = new TokenTypeStatsState(tokenType);
    state.save();
  }

  return state;
}

/**
 * Track token type statistics in timeseries
 * This calculates percentage of total supply value
 */
function trackTokenTypeStats(state: TokenTypeStatsState): void {
  // Get total system value - for now we'll use a simplified approach
  // In a complete implementation, we'd need to track the system address
  const totalSystemValue = getTotalSystemValue();

  // Calculate percentage
  let percentageOfTotalSupply = BigDecimal.zero();
  if (totalSystemValue.gt(BigDecimal.zero())) {
    percentageOfTotalSupply = state.totalValueInBaseCurrency
      .times(BigDecimal.fromString("100"))
      .div(totalSystemValue);
  }

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const tokenTypeStats = new TokenTypeStatsData(1);
  tokenTypeStats.type = state.type;
  tokenTypeStats.count = state.count;
  tokenTypeStats.percentageOfTotalSupply = percentageOfTotalSupply;
  tokenTypeStats.save();
}

/**
 * Get total system value from SystemStatsState
 * This uses a global system address
 */
function getTotalSystemValue(): BigDecimal {
  // For now, we return BigDecimal.zero() as a placeholder
  // In a complete implementation, we would need to:
  // 1. Maintain a global system address state
  // 2. Load the SystemStatsState using that address
  // 3. Return the totalValueInBaseCurrency

  // TODO: Implement proper system address tracking
  // This could be done by:
  // - Storing the system address in a global state entity
  // - Passing the system address through token context
  // - Using a singleton pattern for system stats

  return BigDecimal.zero();
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
