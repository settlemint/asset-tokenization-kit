import { store } from "@graphprotocol/graph-ts";
import {
  CountryModified as CountryModifiedEvent,
  IdentityModified as IdentityModifiedEvent,
  IdentityRegistryBound as IdentityRegistryBoundEvent,
  IdentityRegistryUnbound as IdentityRegistryUnboundEvent,
  IdentityStored as IdentityStoredEvent,
  IdentityUnstored as IdentityUnstoredEvent,
  IdentityWalletMarkedAsLost as IdentityWalletMarkedAsLostEvent,
  WalletRecoveryLinked as WalletRecoveryLinkedEvent,
} from "../../generated/templates/IdentityRegistryStorage/IdentityRegistryStorage";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityRegistry } from "../identity-registry/fetch/identity-registry";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchRegisteredIdentity } from "../registered-identity/fetch/registered-identity";
import { fetchIdentityRegistryStorage } from "./fetch/identity-registry-storage";

export function handleCountryModified(event: CountryModifiedEvent): void {
  fetchEvent(event, "CountryModified");
  const registeredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params._identityWallet
  );

  registeredIdentity.country = event.params._country;
  registeredIdentity.save();
}

export function handleIdentityModified(event: IdentityModifiedEvent): void {
  fetchEvent(event, "IdentityModified");

  // Ensure the new Identity entity exists before updating the RegisteredIdentity
  const identity = fetchIdentity(event.params._newIdentity);

  const registeredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params._investorAddress
  );

  registeredIdentity.identity = identity.id;
  registeredIdentity.save();
}

export function handleIdentityRegistryBound(
  event: IdentityRegistryBoundEvent
): void {
  fetchEvent(event, "IdentityRegistryBound");
  const identityRegistry = fetchIdentityRegistry(
    event.params._identityRegistry
  );
  const identityRegistryStorage = fetchIdentityRegistryStorage(event.address);
  identityRegistry.identityRegistryStorage = identityRegistryStorage.id;
  identityRegistry.save();
}

export function handleIdentityRegistryUnbound(
  event: IdentityRegistryUnboundEvent
): void {
  fetchEvent(event, "IdentityRegistryUnbound");
  const identityRegistry = fetchIdentityRegistry(
    event.params._identityRegistry
  );
  identityRegistry.identityRegistryStorage = null;
  identityRegistry.save();
}

export function handleIdentityStored(event: IdentityStoredEvent): void {
  fetchEvent(event, "IdentityStored");

  const registeredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params._investorAddress
  );
  const identity = fetchIdentity(event.params._identity);
  registeredIdentity.identity = identity.id;
  registeredIdentity.country = event.params._country;

  registeredIdentity.save();
}

export function handleIdentityUnstored(event: IdentityUnstoredEvent): void {
  fetchEvent(event, "IdentityUnstored");
  const registeredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params._investorAddress
  );

  store.remove("RegisteredIdentity", registeredIdentity.id.toHexString());
}

export function handleIdentityWalletMarkedAsLost(
  event: IdentityWalletMarkedAsLostEvent
): void {
  fetchEvent(event, "IdentityWalletMarkedAsLost");
  const registeredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params.userWallet
  );
  registeredIdentity.isLost = true;
  registeredIdentity.save();
}

export function handleWalletRecoveryLinked(
  event: WalletRecoveryLinkedEvent
): void {
  fetchEvent(event, "WalletRecoveryLinked");
  const oldRegisteredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params.lostWallet
  );
  const recoveredRegisteredIdentity = fetchRegisteredIdentity(
    event.address,
    event.params.newWallet
  );

  oldRegisteredIdentity.isLost = true;
  oldRegisteredIdentity.recoveredIdentity = recoveredRegisteredIdentity.id;

  oldRegisteredIdentity.save();
}
