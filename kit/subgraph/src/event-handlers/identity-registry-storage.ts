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

export function handleCountryModified(event: CountryModified): void {}

export function handleIdentityModified(event: IdentityModified): void {}

export function handleIdentityRegistryBound(
  event: IdentityRegistryBound
): void {}

export function handleIdentityRegistryUnbound(
  event: IdentityRegistryUnbound
): void {}

export function handleIdentityStored(event: IdentityStored): void {}

export function handleIdentityUnstored(event: IdentityUnstored): void {}

export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleUpgraded(event: Upgraded): void {}
