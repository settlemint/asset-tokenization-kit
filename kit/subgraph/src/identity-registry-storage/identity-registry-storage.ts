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

export function handleCountryModified(event: CountryModifiedEvent): void {
  fetchEvent(event, "CountryModified");
}

export function handleIdentityModified(event: IdentityModifiedEvent): void {
  fetchEvent(event, "IdentityModified");
}

export function handleIdentityRegistryBound(
  event: IdentityRegistryBoundEvent
): void {
  fetchEvent(event, "IdentityRegistryBound");
}

export function handleIdentityRegistryUnbound(
  event: IdentityRegistryUnboundEvent
): void {
  fetchEvent(event, "IdentityRegistryUnbound");
}

export function handleIdentityStored(event: IdentityStoredEvent): void {
  fetchEvent(event, "IdentityStored");
}

export function handleIdentityUnstored(event: IdentityUnstoredEvent): void {
  fetchEvent(event, "IdentityUnstored");
}

export function handleIdentityWalletMarkedAsLost(
  event: IdentityWalletMarkedAsLostEvent
): void {
  fetchEvent(event, "IdentityWalletMarkedAsLost");
}

export function handleWalletRecoveryLinked(
  event: WalletRecoveryLinkedEvent
): void {
  fetchEvent(event, "WalletRecoveryLinked");
}
