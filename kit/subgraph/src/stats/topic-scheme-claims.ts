import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  TopicScheme,
  TopicSchemeClaimsData,
  TopicSchemeClaimsState,
} from "../../generated/schema";

/**
 * Fetch or create TopicSchemeClaimsState entity
 */
export function fetchTopicSchemeClaimsState(
  topicSchemeId: Bytes
): TopicSchemeClaimsState {
  let state = TopicSchemeClaimsState.load(topicSchemeId);

  if (!state) {
    state = new TopicSchemeClaimsState(topicSchemeId);
    state.topicScheme = topicSchemeId;
    state.totalIssuedClaims = BigInt.fromI32(0);
    state.totalActiveClaims = BigInt.fromI32(0);
    state.totalRemovedClaims = BigInt.fromI32(0);
    state.totalRevokedClaims = BigInt.fromI32(0);
    state.save();
  }

  return state;
}

/**
 * Track topic scheme claims stats by creating a timeseries data point
 */
function trackTopicSchemeClaims(topicSchemeId: Bytes): void {
  const state = fetchTopicSchemeClaimsState(topicSchemeId);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const statsData = new TopicSchemeClaimsData(1);
  statsData.topicScheme = topicSchemeId;
  statsData.totalIssuedClaims = state.totalIssuedClaims;
  statsData.totalActiveClaims = state.totalActiveClaims;
  statsData.totalRemovedClaims = state.totalRemovedClaims;
  statsData.totalRevokedClaims = state.totalRevokedClaims;
  statsData.save();
}

/**
 * Increment claim issued counter for a topic scheme
 */
export function incrementClaimsIssued(topicScheme: TopicScheme): void {
  const state = fetchTopicSchemeClaimsState(topicScheme.id);
  state.totalIssuedClaims = state.totalIssuedClaims.plus(BigInt.fromI32(1));
  state.totalActiveClaims = state.totalActiveClaims.plus(BigInt.fromI32(1));
  state.save();

  trackTopicSchemeClaims(topicScheme.id);
}

/**
 * Increment claim removed counter for a topic scheme
 */
export function incrementClaimsRemoved(
  topicScheme: TopicScheme,
  wasAlreadyRevoked: boolean
): void {
  const state = fetchTopicSchemeClaimsState(topicScheme.id);
  state.totalRemovedClaims = state.totalRemovedClaims.plus(BigInt.fromI32(1));

  // If the claim was not already revoked, we need to decrement active claims
  if (!wasAlreadyRevoked) {
    state.totalActiveClaims = state.totalActiveClaims.minus(BigInt.fromI32(1));
  }

  state.save();

  trackTopicSchemeClaims(topicScheme.id);
}

/**
 * Increment claim revoked counter for a topic scheme
 */
export function incrementClaimsRevoked(topicScheme: TopicScheme): void {
  const state = fetchTopicSchemeClaimsState(topicScheme.id);
  state.totalActiveClaims = state.totalActiveClaims.minus(BigInt.fromI32(1));
  state.totalRevokedClaims = state.totalRevokedClaims.plus(BigInt.fromI32(1));
  state.save();

  trackTopicSchemeClaims(topicScheme.id);
}
