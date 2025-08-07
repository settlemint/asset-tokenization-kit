import { Address } from "@graphprotocol/graph-ts";
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
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityRegistry } from "../identity-registry/fetch/identity-registry";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchIdentityRegistryStorage } from "./fetch/identity-registry-storage";

export function handleCountryModified(event: CountryModifiedEvent): void {
  fetchEvent(event, "CountryModified");
  const account = fetchAccount(event.params._identityWallet);
  account.country = event.params._country;
  account.save();
}

export function handleIdentityModified(event: IdentityModifiedEvent): void {
  fetchEvent(event, "IdentityModified");

  const oldIdentity = fetchIdentity(event.params._oldIdentity);
  const newIdentity = fetchIdentity(event.params._newIdentity);

  if (oldIdentity.account) {
    const account = fetchAccount(Address.fromBytes(oldIdentity.account!));
    account.identity = newIdentity.id;
    account.save();

    newIdentity.account = oldIdentity.account;
    newIdentity.save();
  }
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
  const identityRegistryStorage = fetchIdentityRegistryStorage(event.address);
  const identity = fetchIdentity(event.params._identity);
  identity.registryStorage = identityRegistryStorage.id;
  const account = fetchAccount(event.params._investorAddress);
  account.identity = identity.id;
  account.save();
  identity.account = account.id;
  identity.save();
}

export function handleIdentityUnstored(event: IdentityUnstoredEvent): void {
  fetchEvent(event, "IdentityUnstored");
  const identity = fetchIdentity(event.params._identity);
  identity.registryStorage = null;
  identity.save();
}

export function handleIdentityWalletMarkedAsLost(
  event: IdentityWalletMarkedAsLostEvent
): void {
  fetchEvent(event, "IdentityWalletMarkedAsLost");
  const account = fetchAccount(event.params.userWallet);
  account.isLost = true;
  account.save();
}

export function handleWalletRecoveryLinked(
  event: WalletRecoveryLinkedEvent
): void {
  fetchEvent(event, "WalletRecoveryLinked");
  const lostAccount = fetchAccount(event.params.lostWallet);
  const newAccount = fetchAccount(event.params.newWallet);
  lostAccount.recoveredAccount = newAccount.id;
  lostAccount.save();
}
