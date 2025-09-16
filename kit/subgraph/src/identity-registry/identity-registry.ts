import {
  IdentityRegistered as IdentityRegisteredEvent,
  IdentityRemoved as IdentityRemovedEvent,
  IdentityStorageSet,
  TopicSchemeRegistrySet,
  TrustedIssuersRegistrySet,
} from "../../generated/templates/IdentityRegistry/IdentityRegistry";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityRegistryStorage } from "../identity-registry-storage/fetch/identity-registry-storage";
import { fetchIdentity } from "../identity/fetch/identity";
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

export function handleIdentityRegistered(event: IdentityRegisteredEvent): void {
  fetchEvent(event, "IdentityRegistered");

  const investor = fetchAccount(event.params._investorAddress);
  const identity = fetchIdentity(event.params._identity);

  investor.identity = identity.id;
  investor.country = event.params._country;
  investor.save();

  identity.account = investor.id;
  identity.isRegistered = true;
  identity.save();
}

export function handleIdentityRemoved(event: IdentityRemovedEvent): void {
  fetchEvent(event, "IdentityRemoved");

  const identity = fetchIdentity(event.params._identity);
  identity.isRegistered = false;
  identity.account = null;
  identity.save();

  const investor = fetchAccount(event.params._investorAddress);
  investor.identity = null;
  investor.save();
}
