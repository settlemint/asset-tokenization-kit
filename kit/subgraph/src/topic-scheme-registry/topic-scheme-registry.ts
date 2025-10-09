import { Bytes } from "@graphprotocol/graph-ts";
import {
  TopicSchemeRegistered,
  TopicSchemeRemoved,
  TopicSchemeUpdated,
  TopicSchemesBatchRegistered,
} from "../../generated/templates/TopicSchemeRegistry/TopicSchemeRegistry";
import { fetchEvent } from "../event/fetch/event";
import {
  incrementTopicSchemesRegistered,
  incrementTopicSchemesRemoved,
} from "../stats/topic-schemes";
import { fetchTopicScheme } from "./fetch/topic-scheme";
import { fetchTopicSchemeRegistry } from "./fetch/topic-scheme-registry";

export function handleTopicSchemeRegistered(
  event: TopicSchemeRegistered
): void {
  fetchEvent(event, "TopicSchemeRegistered");
  const topicScheme = fetchTopicScheme(event.params.topicId, event.address);
  if (topicScheme.deployedInTransaction.equals(Bytes.empty())) {
    topicScheme.deployedInTransaction = event.transaction.hash;
  }
  topicScheme.name = event.params.name;
  topicScheme.topicId = event.params.topicId;
  topicScheme.signature = event.params.signature;
  topicScheme.save();

  const registry = fetchTopicSchemeRegistry(event.address);
  incrementTopicSchemesRegistered(registry);
}

export function handleTopicSchemeRemoved(event: TopicSchemeRemoved): void {
  fetchEvent(event, "TopicSchemeRemoved");
  const topicScheme = fetchTopicScheme(event.params.topicId, event.address);
  topicScheme.enabled = false;
  topicScheme.save();

  const registry = fetchTopicSchemeRegistry(event.address);
  incrementTopicSchemesRemoved(registry);
}

export function handleTopicSchemeUpdated(event: TopicSchemeUpdated): void {
  fetchEvent(event, "TopicSchemeUpdated");
  const topicScheme = fetchTopicScheme(event.params.topicId, event.address);
  topicScheme.name = event.params.name;
  topicScheme.topicId = event.params.topicId;
  topicScheme.signature = event.params.newSignature;
  topicScheme.save();
}

export function handleTopicSchemesBatchRegistered(
  event: TopicSchemesBatchRegistered
): void {
  fetchEvent(event, "TopicSchemesBatchRegistered");

  const topicIds = event.params.topicIds;
  const names = event.params.names;
  const signatures = event.params.signatures;

  const registry = fetchTopicSchemeRegistry(event.address);

  for (let i = 0; i < topicIds.length; i++) {
    const topicScheme = fetchTopicScheme(topicIds[i], event.address);
    if (topicScheme.deployedInTransaction.equals(Bytes.empty())) {
      topicScheme.deployedInTransaction = event.transaction.hash;
    }
    topicScheme.name = names[i];
    topicScheme.topicId = topicIds[i];
    topicScheme.signature = signatures[i];
    topicScheme.save();
  }
}
