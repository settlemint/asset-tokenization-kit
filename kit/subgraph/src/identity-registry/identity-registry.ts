import {
  IdentityStorageSet,
  TopicSchemeRegistrySet,
  TrustedIssuersRegistrySet,
  IdentityRegistered,
} from "../../generated/templates/IdentityRegistry/IdentityRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
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

  // Ensure the Identity entity exists before the IdentityStored event is processed
  fetchIdentity(event.params._identity);

  // Note: The actual RegisteredIdentity creation is handled by the IdentityStored
  // event from the IdentityRegistryStorage contract, which provides the storage
  // contract address directly. This handler just ensures the Identity entity exists.
}
