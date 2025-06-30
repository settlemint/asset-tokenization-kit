import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  IdentityClaim,
  SystemStatsData,
  SystemStatsState,
  Token,
  TokenFactory,
  TokenFactoryRegistry,
} from "../../generated/schema";
import { fetchIdentityClaimValue } from "../identity/fetch/identity-claim-value";
import { fetchSystem } from "../system/fetch/system";
import { toBigDecimal } from "../utils/token-decimals";

const BASE_PRICE_DECIMALS = 18;

/**
 * Get base price for a token from its basePriceClaim
 */
export function getTokenBasePrice(token: Token | null): BigDecimal {
  if (!token) {
    return BigDecimal.zero();
  }

  if (!token.basePriceClaim) {
    return BigDecimal.zero();
  }

  // Get base price from claim
  const claim = IdentityClaim.load(token.basePriceClaim!);
  if (!claim) {
    return BigDecimal.zero();
  }

  const basePriceClaimValue = fetchIdentityClaimValue(claim, "amount");

  if (!basePriceClaimValue || !basePriceClaimValue.value) {
    return BigDecimal.zero();
  }

  return toBigDecimal(
    BigInt.fromString(basePriceClaimValue.value),
    BASE_PRICE_DECIMALS
  );
}

/**
 * Update system stats when token supply changes (mint/burn)
 * This calculates the delta and updates the total
 */
export function updateSystemStatsForSupplyChange(
  token: Token,
  supplyDelta: BigDecimal,
  timestamp: BigInt
): void {
  const systemAddress = getSystemAddress(token);
  const state = fetchSystemStatsState(systemAddress);
  const basePrice = getTokenBasePrice(token);

  // Calculate value delta = supplyDelta * basePrice
  const valueDelta = supplyDelta.times(basePrice);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);
  state.lastUpdatedAt = timestamp;
  state.save();

  // Create timeseries entry
  trackSystemStats(systemAddress, state.totalValueInBaseCurrency);
}

/**
 * Update system stats when base price changes
 * This recalculates the value difference for the token
 */
export function updateSystemStatsForPriceChange(
  token: Token,
  oldPrice: BigDecimal,
  newPrice: BigDecimal,
  timestamp: BigInt
): void {
  const systemAddress = getSystemAddress(token);
  const state = fetchSystemStatsState(systemAddress);

  // Calculate value delta
  const oldValue = oldPrice.times(token.totalSupply);
  const newValue = newPrice.times(token.totalSupply);
  const valueDelta = newValue.minus(oldValue);

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);
  state.lastUpdatedAt = timestamp;
  state.save();

  // Create timeseries entry
  trackSystemStats(systemAddress, state.totalValueInBaseCurrency);
}

/**
 * Fetch or create SystemStatsState entity
 */
function fetchSystemStatsState(systemAddress: Address): SystemStatsState {
  let state = SystemStatsState.load(systemAddress);

  if (!state) {
    state = new SystemStatsState(systemAddress);
    state.system = fetchSystem(systemAddress).id;
    state.totalValueInBaseCurrency = BigDecimal.zero();
    state.lastUpdatedAt = BigInt.zero();
    state.save();
  }

  return state;
}

/**
 * Track system statistics in timeseries
 */
function trackSystemStats(
  systemAddress: Address,
  totalValue: BigDecimal
): void {
  // Create timeseries entry - ID is auto-generated for timeseries entities
  const systemStats = new SystemStatsData(1);

  systemStats.system = fetchSystem(systemAddress).id;
  systemStats.totalValueInBaseCurrency = totalValue;

  systemStats.save();
}

/**
 * Get the system address from a token
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
