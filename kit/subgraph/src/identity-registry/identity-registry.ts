import {
  IdentityRecovered,
  IdentityRegistered,
  IdentityRemoved,
  IdentityStorageSet,
  TopicSchemeRegistrySet,
  TrustedIssuersRegistrySet,
} from "../../generated/templates/IdentityRegistry/IdentityRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityRegistryStorage } from "../identity-registry-storage/fetch/identity-registry-storage";
import { fetchTopicSchemeRegistry } from "../topic-scheme-registry/fetch/topic-scheme-registry";
import { fetchTrustedIssuersRegistry } from "../trusted-issuers-registry/fetch/trusted-issuers-registry";
import { fetchIdentityRegistry } from "./fetch/identity-registry";

export function handleIdentityStorageSet(event: IdentityStorageSet): void {
  fetchEvent(event, "IdentityStorageSet");
  const identityRegistry = fetchIdentityRegistry(event.address);
  const identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params._identityStorage
  );
  identityRegistry.identityRegistryStorage = identityRegistryStorage.id;
  identityRegistry.save();
}

export function handleTopicSchemeRegistrySet(
  event: TopicSchemeRegistrySet
): void {
  fetchEvent(event, "TopicSchemeRegistrySet");
  const identityRegistry = fetchIdentityRegistry(event.address);
  identityRegistry.topicSchemeRegistry = fetchTopicSchemeRegistry(
    event.params._topicSchemeRegistry
  ).id;
  identityRegistry.save();
}

export function handleTrustedIssuersRegistrySet(
  event: TrustedIssuersRegistrySet
): void {
  fetchEvent(event, "TrustedIssuersRegistrySet");
  const identityRegistry = fetchIdentityRegistry(event.address);
  identityRegistry.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params._trustedIssuersRegistry
  ).id;
  identityRegistry.save();
}

export function handleIdentityRegistered(event: IdentityRegistered): void {
  fetchEvent(event, "IdentityRegistered");
}

export function handleIdentityRemoved(event: IdentityRemoved): void {
  fetchEvent(event, "IdentityRemoved");
}

export function handleIdentityRecovered(event: IdentityRecovered): void {
  fetchEvent(event, "IdentityRecovered");
}
