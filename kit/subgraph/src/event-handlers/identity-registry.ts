import {
  CountryUpdated,
  IdentityRegistered,
  IdentityRemoved,
  IdentityStorageSet,
  IdentityUpdated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  TrustedIssuersRegistrySet,
} from "../../generated/templates/IdentityRegistry/IdentityRegistry";
import { RoleRevoked } from "../../generated/templates/System/System";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

export function handleCountryUpdated(event: CountryUpdated): void {
  processEvent(event, "CountryUpdated");
}

export function handleIdentityRegistered(event: IdentityRegistered): void {
  processEvent(event, "IdentityRegistered");
}

export function handleIdentityRemoved(event: IdentityRemoved): void {
  processEvent(event, "IdentityRemoved");
}

export function handleIdentityStorageSet(event: IdentityStorageSet): void {
  processEvent(event, "IdentityStorageSet");
}

export function handleIdentityUpdated(event: IdentityUpdated): void {
  processEvent(event, "IdentityUpdated");
}

export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}

export function handleTrustedIssuersRegistrySet(
  event: TrustedIssuersRegistrySet
): void {
  processEvent(event, "TrustedIssuersRegistrySet");
}
