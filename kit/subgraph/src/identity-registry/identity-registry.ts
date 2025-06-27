import { Address } from '@graphprotocol/graph-ts';
import type {
  CountryUpdated,
  IdentityRegistered,
  IdentityRemoved,
  IdentityStorageSet,
  IdentityUpdated,
  TopicSchemeRegistrySet,
  TrustedIssuersRegistrySet,
} from '../../generated/templates/IdentityRegistry/IdentityRegistry';
import { fetchAccount } from '../account/fetch/account';
import { fetchEvent } from '../event/fetch/event';
import { fetchIdentity } from '../identity/fetch/identity';
import { fetchTrustedIssuersRegistry } from '../system/fetch/trusted-issuers-registry';
import { fetchTopicSchemeRegistry } from '../topic-scheme-registry/fetch/topic-scheme-registry';
import { fetchIdentityRegistry } from './fetch/identity-registry';
import { fetchIdentityRegistryStorage } from './fetch/identity-registry-storage';

export function handleCountryUpdated(event: CountryUpdated): void {
  fetchEvent(event, 'CountryUpdated');
  const account = fetchAccount(event.params._investorAddress);
  account.country = event.params._country;
  account.save();
}

export function handleIdentityRegistered(event: IdentityRegistered): void {
  fetchEvent(event, 'IdentityRegistered');
  const identityRegistry = fetchIdentityRegistry(event.address);
  const identity = fetchIdentity(event.params._identity);
  identity.registry = identityRegistry.id;
  identity.save();
}

export function handleIdentityRemoved(event: IdentityRemoved): void {
  fetchEvent(event, 'IdentityRemoved');
  const identity = fetchIdentity(event.params._identity);
  identity.registry = Address.zero();
  identity.save();
}

export function handleIdentityStorageSet(event: IdentityStorageSet): void {
  fetchEvent(event, 'IdentityStorageSet');
  const identityRegistry = fetchIdentityRegistry(event.address);
  const identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params._identityStorage
  );
  identityRegistry.identityRegistryStorage = identityRegistryStorage.id;
  identityRegistry.save();
}

export function handleIdentityUpdated(event: IdentityUpdated): void {
  fetchEvent(event, 'IdentityUpdated');
  const identityRegistry = fetchIdentityRegistry(event.address);
  // Reset old identity's registry if it exists
  if (event.params._oldIdentity) {
    const oldIdentity = fetchIdentity(event.params._oldIdentity);
    oldIdentity.registry = Address.zero();
    oldIdentity.save();
  }

  const identity = fetchIdentity(event.params._newIdentity);
  identity.registry = identityRegistry.id;
  identity.save();
}

export function handleTopicSchemeRegistrySet(
  event: TopicSchemeRegistrySet
): void {
  fetchEvent(event, 'TopicSchemeRegistrySet');
  const identityRegistry = fetchIdentityRegistry(event.address);
  identityRegistry.topicSchemeRegistry = fetchTopicSchemeRegistry(
    event.params._topicSchemeRegistry
  ).id;
  identityRegistry.save();
}

export function handleTrustedIssuersRegistrySet(
  event: TrustedIssuersRegistrySet
): void {
  fetchEvent(event, 'TrustedIssuersRegistrySet');
  const identityRegistry = fetchIdentityRegistry(event.address);
  identityRegistry.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params._trustedIssuersRegistry
  ).id;
  identityRegistry.save();
}
