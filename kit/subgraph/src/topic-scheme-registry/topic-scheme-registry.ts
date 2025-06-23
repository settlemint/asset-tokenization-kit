import { Bytes } from "@graphprotocol/graph-ts";
import {
  TopicSchemeRegistered,
  TopicSchemeRemoved,
  TopicSchemeUpdated,
  TopicSchemesBatchRegistered,
} from "../../generated/templates/TopicSchemeRegistry/TopicSchemeRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchTopicScheme } from "./fetch/topic-scheme";

export function handleTopicSchemeRegistered(
  event: TopicSchemeRegistered
): void {
  fetchEvent(event, "TopicSchemeRegistered");
  const topicScheme = fetchTopicScheme(event.params.topicId);
  if (topicScheme.deployedInTransaction.equals(Bytes.empty())) {
    topicScheme.deployedInTransaction = event.transaction.hash;
  }
  topicScheme.name = event.params.name;
  topicScheme.topicId = event.params.topicId;
  topicScheme.signature = event.params.signature;
  topicScheme.save();
}

export function handleTopicSchemeRemoved(event: TopicSchemeRemoved): void {
  fetchEvent(event, "TopicSchemeRemoved");
  const topicScheme = fetchTopicScheme(event.params.topicId);
  topicScheme.enabled = false;
  topicScheme.save();
}

export function handleTopicSchemeUpdated(event: TopicSchemeUpdated): void {
  fetchEvent(event, "TopicSchemeUpdated");
  const topicScheme = fetchTopicScheme(event.params.topicId);
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

  for (let i = 0; i < topicIds.length; i++) {
    const topicScheme = fetchTopicScheme(topicIds[i]);
    if (topicScheme.deployedInTransaction.equals(Bytes.empty())) {
      topicScheme.deployedInTransaction = event.transaction.hash;
    }
    topicScheme.name = names[i];
    topicScheme.topicId = topicIds[i];
    topicScheme.signature = signatures[i];
    topicScheme.save();
  }
}
