import { Bytes, store } from "@graphprotocol/graph-ts";
import {
  ClaimTopicsUpdated as ClaimTopicsUpdatedEvent,
  TrustedIssuerAdded as TrustedIssuerAddedEvent,
  TrustedIssuerRemoved as TrustedIssuerRemovedEvent,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchTopicScheme } from "../topic-scheme-registry/fetch/topic-scheme";
import { fetchTrustedIssuer } from "./fetch/trusted-issuer";
import { fetchTrustedIssuersRegistry } from "./fetch/trusted-issuers-registry";

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdatedEvent): void {
  fetchEvent(event, "ClaimTopicsUpdated");

  const trustedIssuer = fetchTrustedIssuer(event.params._issuer);
  trustedIssuer.claimTopics = event.params._claimTopics.map<Bytes>(
    (topic) => fetchTopicScheme(topic).id
  );
  trustedIssuer.save();
}

export function handleTrustedIssuerAdded(event: TrustedIssuerAddedEvent): void {
  fetchEvent(event, "TrustedIssuerAdded");

  const trustedIssuerRegistry = fetchTrustedIssuersRegistry(event.address);
  const trustedIssuer = fetchTrustedIssuer(event.params._issuer);
  trustedIssuer.registry = trustedIssuerRegistry.id;
  trustedIssuer.deployedInTransaction = event.transaction.hash;
  trustedIssuer.claimTopics = event.params._claimTopics.map<Bytes>(
    (topic) => fetchTopicScheme(topic).id
  );
  trustedIssuer.save();
}

export function handleTrustedIssuerRemoved(
  event: TrustedIssuerRemovedEvent
): void {
  fetchEvent(event, "TrustedIssuerRemoved");

  const trustedIssuer = fetchTrustedIssuer(event.params._issuer);
  store.remove("TrustedIssuer", trustedIssuer.id.toHexString());
}
