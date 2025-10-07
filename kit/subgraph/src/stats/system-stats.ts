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

export class SystemAssetActivity {
  static TRANSFER: string = "transfer";
  static FORCED_TRANSFER: string = "forcedTransfer";
  static MINT: string = "mint";
  static BURN: string = "burn";
  static CLAWBACK: string = "clawback";
}

/**
 * Increment system-level counters for asset activity events
 */
export function incrementSystemAssetActivity(
  token: Token,
  activity: string
): void {
  const systemAddress = getTokenSystemAddress(token);

  if (systemAddress.equals(Address.zero())) {
    log.warning(
      "Skipped incrementing system activity {} for token {} - system not set",
      [activity, token.id.toHexString()]
    );
    return;
  }

  const state = fetchSystemStatsState(systemAddress);

  if (activity == SystemAssetActivity.TRANSFER) {
    state.transferEventsCount = state.transferEventsCount + 1;
  } else if (activity == SystemAssetActivity.FORCED_TRANSFER) {
    state.forcedTransferEventsCount = state.forcedTransferEventsCount + 1;
  } else if (activity == SystemAssetActivity.MINT) {
    state.mintEventsCount = state.mintEventsCount + 1;
  } else if (activity == SystemAssetActivity.BURN) {
    state.burnEventsCount = state.burnEventsCount + 1;
  } else if (activity == SystemAssetActivity.CLAWBACK) {
    state.clawbackEventsCount = state.clawbackEventsCount + 1;
  } else {
    log.warning("Unknown system asset activity {} for token {}", [
      activity,
      token.id.toHexString(),
    ]);
    return;
  }

  state.save();

  trackSystemStats(systemAddress);
}

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
  trackSystemStats(systemAddress);

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
  trackSystemStats(systemAddress);

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
  trackSystemStats(systemAddress);
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
  trackSystemStats(systemAddress);
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
    state.transferEventsCount = 0;
    state.forcedTransferEventsCount = 0;
    state.mintEventsCount = 0;
    state.burnEventsCount = 0;
    state.clawbackEventsCount = 0;
    state.save();
  }

  return state;
}

/**
 * Track system statistics in timeseries
 */
function trackSystemStats(systemAddress: Address): void {
  const state = fetchSystemStatsState(systemAddress);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const systemStats = new SystemStatsData(1);

  systemStats.system = fetchSystem(systemAddress).id;
  systemStats.totalValueInBaseCurrency = state.totalValueInBaseCurrency;
  systemStats.tokensCreatedCount = state.tokensCreatedCount;
  systemStats.tokensLaunchedCount = state.tokensLaunchedCount;
  systemStats.transferEventsCount = state.transferEventsCount;
  systemStats.forcedTransferEventsCount = state.forcedTransferEventsCount;
  systemStats.mintEventsCount = state.mintEventsCount;
  systemStats.burnEventsCount = state.burnEventsCount;
  systemStats.clawbackEventsCount = state.clawbackEventsCount;

  systemStats.save();
}
