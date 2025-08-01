import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import {
  SystemStatsData,
  SystemStatsState,
  Token,
} from "../../generated/schema";
import { fetchSystem } from "../system/fetch/system";
import {
  getTokenBasePrice,
  getTokenSystemAddress,
} from "../token/utils/token-utils";

/**
 * Update system stats when token supply changes (mint/burn)
 * This calculates the delta and updates the total
 */
export function updateSystemStatsForSupplyChange(
  token: Token,
  supplyDelta: BigDecimal
): BigDecimal {
  const systemAddress = getTokenSystemAddress(token);
  const state = fetchSystemStatsState(systemAddress);
  const basePrice = getTokenBasePrice(token.basePriceClaim);

  // Calculate value delta = supplyDelta * basePrice
  const valueDelta = supplyDelta.times(basePrice);

  if (valueDelta.equals(BigDecimal.zero())) {
    return state.totalValueInBaseCurrency;
  }

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.save();

  // Create timeseries entry
  trackSystemStats(systemAddress, state.totalValueInBaseCurrency);

  return state.totalValueInBaseCurrency;
}

/**
 * Update system stats when base price changes
 * This recalculates the value difference for the token
 */
export function updateSystemStatsForPriceChange(
  token: Token,
  oldPrice: BigDecimal,
  newPrice: BigDecimal
): BigDecimal {
  const systemAddress = getTokenSystemAddress(token);
  const state = fetchSystemStatsState(systemAddress);

  // Calculate value delta
  const oldValue = oldPrice.times(token.totalSupply);
  const newValue = newPrice.times(token.totalSupply);
  const valueDelta = newValue.minus(oldValue);

  if (valueDelta.equals(BigDecimal.zero())) {
    return state.totalValueInBaseCurrency;
  }

  // Update total value
  state.totalValueInBaseCurrency =
    state.totalValueInBaseCurrency.plus(valueDelta);

  state.save();

  // Create timeseries entry
  trackSystemStats(systemAddress, state.totalValueInBaseCurrency);

  return state.totalValueInBaseCurrency;
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
