import { Bytes } from "@graphprotocol/graph-ts";
import {
  TrustedIssuersRegistry,
  TrustedIssuerStatsData,
  TrustedIssuerStatsState,
} from "../../generated/schema";

/**
 * Fetch or create TrustedIssuerStatsState entity
 */
function fetchTrustedIssuerStatsState(
  trustedIssuersRegistryId: Bytes
): TrustedIssuerStatsState {
  let state = TrustedIssuerStatsState.load(trustedIssuersRegistryId);

  if (!state) {
    state = new TrustedIssuerStatsState(trustedIssuersRegistryId);
    state.trustedIssuersRegistry = trustedIssuersRegistryId;
    state.totalAddedTrustedIssuers = 0;
    state.totalActiveTrustedIssuers = 0;
    state.totalRemovedTrustedIssuers = 0;
    state.save();
  }

  return state;
}

/**
 * Track trusted issuer stats by creating a timeseries data point
 */
function trackTrustedIssuerStats(trustedIssuersRegistryId: Bytes): void {
  const state = fetchTrustedIssuerStatsState(trustedIssuersRegistryId);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const statsData = new TrustedIssuerStatsData(1);
  statsData.trustedIssuersRegistry = trustedIssuersRegistryId;
  statsData.totalAddedTrustedIssuers = state.totalAddedTrustedIssuers;
  statsData.totalActiveTrustedIssuers = state.totalActiveTrustedIssuers;
  statsData.totalRemovedTrustedIssuers = state.totalRemovedTrustedIssuers;
  statsData.save();
}

/**
 * Increment trusted issuer added counter
 */
export function incrementTrustedIssuersAdded(
  trustedIssuersRegistry: TrustedIssuersRegistry
): void {
  const state = fetchTrustedIssuerStatsState(trustedIssuersRegistry.id);
  state.totalAddedTrustedIssuers = state.totalAddedTrustedIssuers + 1;
  state.totalActiveTrustedIssuers = state.totalActiveTrustedIssuers + 1;
  state.save();

  trackTrustedIssuerStats(trustedIssuersRegistry.id);
}

/**
 * Increment trusted issuer removed counter
 */
export function incrementTrustedIssuersRemoved(
  trustedIssuersRegistry: TrustedIssuersRegistry
): void {
  const state = fetchTrustedIssuerStatsState(trustedIssuersRegistry.id);
  state.totalActiveTrustedIssuers = state.totalActiveTrustedIssuers - 1;
  state.totalRemovedTrustedIssuers = state.totalRemovedTrustedIssuers + 1;
  state.save();

  trackTrustedIssuerStats(trustedIssuersRegistry.id);
}
