import { Address, BigDecimal, log } from "@graphprotocol/graph-ts";
import {
  SystemStatsData,
  SystemStatsState,
  Token,
} from "../../generated/schema";
import { fetchSystem } from "../system/fetch/system";
import { fetchBond } from "../token-assets/bond/fetch/bond";
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
  if (token.bond) {
    const bond = fetchBond(Address.fromBytes(token.bond!));
    const denominationAsset = fetchToken(
      Address.fromBytes(bond.denominationAsset)
    );
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

  // Ignore bonds as there value is tracked by its denomination asset
  if (token.bond) {
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
 * Update system stats for token launch (first unpause)
 */
export function updateSystemStatsForTokenLaunch(token: Token): void {
  const isAlreadyLaunched = token.isLaunched;
  if (isAlreadyLaunched) {
    return;
  }

  const systemAddress = getTokenSystemAddress(token);
  const state = fetchSystemStatsState(systemAddress);

  token.isLaunched = true;
  token.save();

  state.tokensLaunchedCount = state.tokensLaunchedCount + 1;
  state.save();

  // Create timeseries entry
  trackSystemStats(systemAddress, state.totalValueInBaseCurrency);
}

/**
 * Update system stats for token creation
 */
export function updateSystemStatsForTokenCreate(token: Token): void {
  const systemAddress = getTokenSystemAddress(token);
  // Sanity check
  if (systemAddress.equals(Address.zero())) {
    log.warning(
      "Skipped increment tokens created count in system stats for token {} - system is not set",
      [token.id.toHexString()]
    );
    return;
  }

  const state = fetchSystemStatsState(systemAddress);

  state.tokensCreatedCount = state.tokensCreatedCount + 1;
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
    state.tokensCreatedCount = 0;
    state.tokensLaunchedCount = 0;
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
  const state = fetchSystemStatsState(systemAddress);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const systemStats = new SystemStatsData(1);

  systemStats.system = fetchSystem(systemAddress).id;
  systemStats.totalValueInBaseCurrency = totalValue;
  systemStats.tokensCreatedCount = state.tokensCreatedCount;
  systemStats.tokensLaunchedCount = state.tokensLaunchedCount;

  systemStats.save();
}
