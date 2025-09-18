import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { TopicScheme, TrustedIssuer } from "../../generated/schema";
import {
  ClaimTopicsUpdated as ClaimTopicsUpdatedEvent,
  TrustedIssuerAdded as TrustedIssuerAddedEvent,
  TrustedIssuerRemoved as TrustedIssuerRemovedEvent,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchSystem } from "../system/fetch/system";
import { fetchTopicScheme } from "../topic-scheme-registry/fetch/topic-scheme";
import { fetchTrustedIssuer } from "./fetch/trusted-issuer";
import { fetchTrustedIssuersRegistry } from "./fetch/trusted-issuers-registry";

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdatedEvent): void {
  fetchEvent(event, "ClaimTopicsUpdated");

  const trustedIssuer = fetchTrustedIssuer(event.params._trustedIssuer);
  const claimTopics = event.params._claimTopics;
  const resolvedTopics = new Array<Bytes>();

  for (let i = 0; i < claimTopics.length; i++) {
    const topicScheme = getTopicSchemeFromTrustedIssuer(
      claimTopics[i],
      trustedIssuer
    );
    if (topicScheme !== null) {
      resolvedTopics.push(topicScheme.id);
    }
  }

  trustedIssuer.claimTopics = resolvedTopics;
  trustedIssuer.save();
}

export function handleTrustedIssuerAdded(event: TrustedIssuerAddedEvent): void {
  fetchEvent(event, "TrustedIssuerAdded");

  const trustedIssuerRegistry = fetchTrustedIssuersRegistry(event.address);
  const trustedIssuer = fetchTrustedIssuer(event.params._trustedIssuer);
  trustedIssuer.registry = trustedIssuerRegistry.id;
  trustedIssuer.deployedInTransaction = event.transaction.hash;
  const claimTopics = event.params._claimTopics;
  const resolvedTopics = new Array<Bytes>();

  for (let i = 0; i < claimTopics.length; i++) {
    const topicScheme = getTopicSchemeFromTrustedIssuer(
      claimTopics[i],
      trustedIssuer
    );
    if (topicScheme !== null) {
      resolvedTopics.push(topicScheme.id);
    }
  }

  trustedIssuer.claimTopics = resolvedTopics;
  trustedIssuer.addedAt = event.block.timestamp;
  trustedIssuer.revokedAt = BigInt.zero();
  trustedIssuer.save();
}

export function handleTrustedIssuerRemoved(
  event: TrustedIssuerRemovedEvent
): void {
  fetchEvent(event, "TrustedIssuerRemoved");

  const trustedIssuer = fetchTrustedIssuer(event.params._trustedIssuer);
  trustedIssuer.revokedAt = event.block.timestamp;
  trustedIssuer.save();
}

function getTopicSchemeFromTrustedIssuer(
  topic: BigInt,
  trustedIssuer: TrustedIssuer
): TopicScheme | null {
  const trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    Address.fromBytes(trustedIssuer.registry)
  );
  const system = fetchSystem(Address.fromBytes(trustedIssuersRegistry.system));
  const topicSchemeRegistry = system.topicSchemeRegistry;
  if (!topicSchemeRegistry) {
    log.error(
      "Topic scheme registry not found for system, cannot get topic scheme",
      [system.id.toHexString()]
    );
    return null;
  }
  return fetchTopicScheme(topic, Address.fromBytes(topicSchemeRegistry!));
}
