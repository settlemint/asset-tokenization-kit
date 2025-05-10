import { Identity } from "../../generated/templates";
import {
  CountryModified,
  IdentityModified,
  IdentityRegistryBound,
  IdentityRegistryUnbound,
  IdentityStored,
  IdentityUnstored,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Upgraded,
} from "../../generated/templates/IdentityRegistryStorage/IdentityRegistryStorage";
import { processEvent } from "../shared/event";

export function handleCountryModified(event: CountryModified): void {
  processEvent(event, "CountryModified");
}

export function handleIdentityModified(event: IdentityModified): void {
  processEvent(event, "IdentityModified");
}

export function handleIdentityRegistryBound(
  event: IdentityRegistryBound
): void {
  processEvent(event, "IdentityRegistryBound");
}

export function handleIdentityRegistryUnbound(
  event: IdentityRegistryUnbound
): void {
  processEvent(event, "IdentityRegistryUnbound");
}

export function handleIdentityStored(event: IdentityStored): void {
  processEvent(event, "IdentityStored");
  Identity.create(event.params._identity);
}

export function handleIdentityUnstored(event: IdentityUnstored): void {
  processEvent(event, "IdentityUnstored");
}

export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  processEvent(event, "RoleAdminChanged");
}

export function handleRoleGranted(event: RoleGranted): void {
  processEvent(event, "RoleGranted");
}

export function handleRoleRevoked(event: RoleRevoked): void {
  processEvent(event, "RoleRevoked");
}

export function handleUpgraded(event: Upgraded): void {
  processEvent(event, "Upgraded");
}
