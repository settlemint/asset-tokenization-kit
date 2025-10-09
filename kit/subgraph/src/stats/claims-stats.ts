import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ClaimsStatsData,
  ClaimsStatsState,
  TopicScheme,
  TopicSchemeRegistry,
} from "../../generated/schema";

/**
 * Fetch or create ClaimsStatsState entity
 */
function fetchClaimsStatsState(registryId: Bytes): ClaimsStatsState {
  let state = ClaimsStatsState.load(registryId);

  if (!state) {
    state = new ClaimsStatsState(registryId);
    state.topicSchemeRegistry = registryId;
    state.totalIssuedClaims = BigInt.fromI32(0);
    state.totalActiveClaims = BigInt.fromI32(0);
    state.totalRemovedClaims = BigInt.fromI32(0);
    state.totalRevokedClaims = BigInt.fromI32(0);
    state.save();
  }

  return state;
}

/**
 * Track claims stats by creating a timeseries data point
 */
function trackClaimsStats(registryId: Bytes): void {
  const state = fetchClaimsStatsState(registryId);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const statsData = new ClaimsStatsData(1);
  statsData.topicSchemeRegistry = registryId;
  statsData.totalIssuedClaims = state.totalIssuedClaims;
  statsData.totalActiveClaims = state.totalActiveClaims;
  statsData.totalRemovedClaims = state.totalRemovedClaims;
  statsData.totalRevokedClaims = state.totalRevokedClaims;
  statsData.save();
}

/**
 * Increment claim issued counter for the registry
 */
export function incrementClaimsIssued(topicScheme: TopicScheme): void {
  const registry = TopicSchemeRegistry.load(topicScheme.registry);
  if (!registry) {
    return;
  }

  const state = fetchClaimsStatsState(registry.id);
  state.totalIssuedClaims = state.totalIssuedClaims.plus(BigInt.fromI32(1));
  state.totalActiveClaims = state.totalActiveClaims.plus(BigInt.fromI32(1));
  state.save();

  trackClaimsStats(registry.id);
}

/**
 * Increment claim removed counter for the registry
 */
export function incrementClaimsRemoved(
  topicScheme: TopicScheme,
  wasAlreadyRevoked: boolean
): void {
  const registry = TopicSchemeRegistry.load(topicScheme.registry);
  if (!registry) {
    return;
  }

  const state = fetchClaimsStatsState(registry.id);
  state.totalRemovedClaims = state.totalRemovedClaims.plus(BigInt.fromI32(1));

  // If the claim was not already revoked, we need to decrement active claims
  if (!wasAlreadyRevoked) {
    state.totalActiveClaims = state.totalActiveClaims.minus(BigInt.fromI32(1));
  }

  state.save();

  trackClaimsStats(registry.id);
}

/**
 * Increment claim revoked counter for the registry
 */
export function incrementClaimsRevoked(topicScheme: TopicScheme): void {
  const registry = TopicSchemeRegistry.load(topicScheme.registry);
  if (!registry) {
    return;
  }

  const state = fetchClaimsStatsState(registry.id);
  state.totalActiveClaims = state.totalActiveClaims.minus(BigInt.fromI32(1));
  state.totalRevokedClaims = state.totalRevokedClaims.plus(BigInt.fromI32(1));
  state.save();

  trackClaimsStats(registry.id);
}
