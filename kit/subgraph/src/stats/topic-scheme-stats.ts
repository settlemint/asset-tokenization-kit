import { Bytes } from "@graphprotocol/graph-ts";
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
    state.totalIssuedClaims = 0;
    state.totalActiveClaims = 0;
    state.totalRemovedClaims = 0;
    state.totalRevokedClaims = 0;
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
  state.totalIssuedClaims = state.totalIssuedClaims + 1;
  state.totalActiveClaims = state.totalActiveClaims + 1;
  state.save();

  trackTopicSchemeStats(topicScheme.id);
}

/**
 * Increment claim removed counter for a topic scheme
 */
export function incrementClaimsRemoved(topicScheme: TopicScheme): void {
  const state = fetchTopicSchemeStatsState(topicScheme.id);
  state.totalActiveClaims = state.totalActiveClaims - 1;
  state.totalRemovedClaims = state.totalRemovedClaims + 1;
  state.save();

  trackTopicSchemeStats(topicScheme.id);
}

/**
 * Increment claim revoked counter for a topic scheme
 */
export function incrementClaimsRevoked(topicScheme: TopicScheme): void {
  const state = fetchTopicSchemeStatsState(topicScheme.id);
  state.totalActiveClaims = state.totalActiveClaims - 1;
  state.totalRevokedClaims = state.totalRevokedClaims + 1;
  state.save();

  trackTopicSchemeStats(topicScheme.id);
}
