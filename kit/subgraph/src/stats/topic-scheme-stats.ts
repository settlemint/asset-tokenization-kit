import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  TopicScheme,
  TopicSchemeStatsData,
  TopicSchemeStatsState,
} from "../../generated/schema";

/**
 * Fetch or create TopicSchemeStatsState entity
 */
function fetchTopicSchemeStatsState(
  topicSchemeId: Bytes
): TopicSchemeStatsState {
  let state = TopicSchemeStatsState.load(topicSchemeId);

  if (!state) {
    state = new TopicSchemeStatsState(topicSchemeId);
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
 * Track topic scheme stats by creating a timeseries data point
 */
function trackTopicSchemeStats(topicSchemeId: Bytes): void {
  const state = fetchTopicSchemeStatsState(topicSchemeId);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const statsData = new TopicSchemeStatsData(1);
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
  const state = fetchTopicSchemeStatsState(topicScheme.id);
  state.totalIssuedClaims = state.totalIssuedClaims.plus(BigInt.fromI32(1));
  state.totalActiveClaims = state.totalActiveClaims.plus(BigInt.fromI32(1));
  state.save();

  trackTopicSchemeStats(topicScheme.id);
}

/**
 * Increment claim removed counter for a topic scheme
 */
export function incrementClaimsRemoved(topicScheme: TopicScheme): void {
  const state = fetchTopicSchemeStatsState(topicScheme.id);
  state.totalRemovedClaims = state.totalRemovedClaims.plus(BigInt.fromI32(1));
  state.save();

  trackTopicSchemeStats(topicScheme.id);
}

/**
 * Increment claim revoked counter for a topic scheme
 */
export function incrementClaimsRevoked(topicScheme: TopicScheme): void {
  const state = fetchTopicSchemeStatsState(topicScheme.id);
  state.totalActiveClaims = state.totalActiveClaims.minus(BigInt.fromI32(1));
  state.totalRevokedClaims = state.totalRevokedClaims.plus(BigInt.fromI32(1));
  state.save();

  trackTopicSchemeStats(topicScheme.id);
}
