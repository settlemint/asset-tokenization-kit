import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { TopicScheme, TrustedIssuer } from "../../generated/schema";
import {
  ClaimTopicsUpdated as ClaimTopicsUpdatedEvent,
  TrustedIssuerAdded as TrustedIssuerAddedEvent,
  TrustedIssuerRemoved as TrustedIssuerRemovedEvent,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { fetchEvent } from "../event/fetch/event";
import {
  incrementTrustedIssuersAdded,
  incrementTrustedIssuersRemoved,
} from "../stats/trusted-issuer-stats";
import { fetchSystem } from "../system/fetch/system";
import { fetchTokenFactory } from "../token-factory/fetch/token-factory";
import { fetchTokenFactoryRegistry } from "../token-factory/fetch/token-factory-registry";
import { fetchToken } from "../token/fetch/token";
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

  // Track stats
  incrementTrustedIssuersAdded(trustedIssuerRegistry);
}

export function handleTrustedIssuerRemoved(
  event: TrustedIssuerRemovedEvent
): void {
  fetchEvent(event, "TrustedIssuerRemoved");

  const trustedIssuer = fetchTrustedIssuer(event.params._trustedIssuer);
  trustedIssuer.revokedAt = event.block.timestamp;
  trustedIssuer.save();

  // Track stats
  const trustedIssuerRegistry = fetchTrustedIssuersRegistry(
    Address.fromBytes(trustedIssuer.registry)
  );
  incrementTrustedIssuersRemoved(trustedIssuerRegistry);
}

function getTopicSchemeFromTrustedIssuer(
  topic: BigInt,
  trustedIssuer: TrustedIssuer
): TopicScheme | null {
  const trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    Address.fromBytes(trustedIssuer.registry)
  );
  if (trustedIssuersRegistry.system) {
    const system = fetchSystem(
      Address.fromBytes(trustedIssuersRegistry.system!)
    );
    const topicSchemeRegistry = system.topicSchemeRegistry;
    if (!topicSchemeRegistry) {
      log.error(
        "Topic scheme registry not found for system: {}, cannot get topic scheme",
        [system.id.toHexString()]
      );
      return null;
    }
    return fetchTopicScheme(topic, Address.fromBytes(topicSchemeRegistry));
  }
  if (trustedIssuersRegistry.token) {
    const token = fetchToken(Address.fromBytes(trustedIssuersRegistry.token!));
    if (!token.tokenFactory) {
      log.error(
        "Token factory not found for token: {}, cannot get topic scheme",
        [token.id.toHexString()]
      );
      return null;
    }
    const tokenFactory = fetchTokenFactory(
      Address.fromBytes(token.tokenFactory!)
    );
    if (!tokenFactory.tokenFactoryRegistry) {
      log.error(
        "Token factory registry not found for token factory: {}, cannot get topic scheme",
        [tokenFactory.id.toHexString()]
      );
      return null;
    }
    const tokenFactoryRegistry = fetchTokenFactoryRegistry(
      Address.fromBytes(tokenFactory.tokenFactoryRegistry!)
    );
    const system = fetchSystem(Address.fromBytes(tokenFactoryRegistry.system));
    const topicSchemeRegistry = system.topicSchemeRegistry;
    if (!topicSchemeRegistry) {
      log.error(
        "Topic scheme registry not found for system: {}, cannot get topic scheme",
        [tokenFactoryRegistry.system.toHexString()]
      );
      return null;
    }
    return fetchTopicScheme(topic, Address.fromBytes(topicSchemeRegistry));
  }
  log.error(
    "No topic scheme registry found for trusted issuers registry: {}, cannot get topic scheme",
    [trustedIssuersRegistry.id.toHexString()]
  );
  return null;
}
