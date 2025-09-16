import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import {
  SystemStatsData,
  SystemStatsState,
  Token,
} from "../../generated/schema";
import { fetchSystem } from "../system/fetch/system";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { TokenExtension } from "../token-extensions/utils/token-extensions-utils";
import { fetchToken } from "../token/fetch/token";
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

  let valueDelta = BigDecimal.zero();

  // For bonds the value delta equals the face value times the price of the denomination asset
  if (token.extensions.includes(TokenExtension.BOND)) {
    const bond = fetchBond(token.id);
    const denominationAsset = fetchToken(bond.denominationAsset);
    const basePrice = getTokenBasePrice(denominationAsset.basePriceClaim);
    valueDelta = supplyDelta.times(bond.faceValue).times(basePrice);
  } else {
    const basePrice = getTokenBasePrice(token.basePriceClaim);
    // Calculate value delta = supplyDelta * basePrice
    valueDelta = supplyDelta.times(basePrice);
  }

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

  // Ignore bonds as there value is tracked by it's denomination asset
  if (token.extensions.includes(TokenExtension.BOND)) {
    return state.totalValueInBaseCurrency;
  }

  // Calculate value delta
  const oldValue = oldPrice.times(token.totalSupply);
  const newValue = newPrice.times(token.totalSupply);
  let valueDelta = newValue.minus(oldValue);

  // Check if the token is a denomination asset for a bond
  // For bonds the value equals the face value times the price of the denomination asset
  const bonds = token.denominationAssetForBond.load();
  for (let i = 0; i < bonds.length; i++) {
    const bondToken = fetchToken(bonds[i].id);
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
