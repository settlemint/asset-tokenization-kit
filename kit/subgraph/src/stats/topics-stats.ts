import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  TopicSchemeRegistry,
  TopicsStatsData,
  TopicsStatsState,
} from "../../generated/schema";

/**
 * Fetch or create TopicsStatsState entity
 */
function fetchTopicsStatsState(topicSchemeRegistryId: Bytes): TopicsStatsState {
  let state = TopicsStatsState.load(topicSchemeRegistryId);

  if (!state) {
    state = new TopicsStatsState(topicSchemeRegistryId);
    state.topicSchemeRegistry = topicSchemeRegistryId;
    state.totalRegisteredTopicSchemes = BigInt.fromI32(0);
    state.totalActiveTopicSchemes = BigInt.fromI32(0);
    state.totalRemovedTopicSchemes = BigInt.fromI32(0);
    state.save();
  }

  return state;
}

/**
 * Track topics stats by creating a timeseries data point
 */
function trackTopicsStats(topicSchemeRegistry: TopicSchemeRegistry): void {
  const state = fetchTopicsStatsState(topicSchemeRegistry.id);

  // Create timeseries entry - ID is auto-generated for timeseries entities
  const statsData = new TopicsStatsData(1);
  statsData.topicSchemeRegistry = topicSchemeRegistry.id;
  statsData.totalRegisteredTopicSchemes = state.totalRegisteredTopicSchemes;
  statsData.totalActiveTopicSchemes = state.totalActiveTopicSchemes;
  statsData.totalRemovedTopicSchemes = state.totalRemovedTopicSchemes;
  statsData.save();
}

/**
 * Increment topic schemes registered counter
 */
export function incrementTopicSchemesRegistered(
  topicSchemeRegistry: TopicSchemeRegistry
): void {
  const state = fetchTopicsStatsState(topicSchemeRegistry.id);
  state.totalRegisteredTopicSchemes = state.totalRegisteredTopicSchemes.plus(
    BigInt.fromI32(1)
  );
  state.totalActiveTopicSchemes = state.totalActiveTopicSchemes.plus(
    BigInt.fromI32(1)
  );
  state.save();

  trackTopicsStats(topicSchemeRegistry);
}

/**
 * Increment topic schemes removed counter
 */
export function incrementTopicSchemesRemoved(
  topicSchemeRegistry: TopicSchemeRegistry
): void {
  const state = fetchTopicsStatsState(topicSchemeRegistry.id);
  state.totalActiveTopicSchemes = state.totalActiveTopicSchemes.minus(
    BigInt.fromI32(1)
  );
  state.totalRemovedTopicSchemes = state.totalRemovedTopicSchemes.plus(
    BigInt.fromI32(1)
  );
  state.save();

  trackTopicsStats(topicSchemeRegistry);
}
