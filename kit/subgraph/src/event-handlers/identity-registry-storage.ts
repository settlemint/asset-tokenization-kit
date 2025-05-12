import {
  CountryModified,
  IdentityModified,
  IdentityStored,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/IdentityRegistryStorage/IdentityRegistryStorage";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event";

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}

export function handleCountryModified(event: CountryModified): void {
  processEvent(event, "CountryModified");
}

export function handleIdentityModified(event: IdentityModified): void {
  processEvent(event, "IdentityModified");
}

export function handleIdentityStored(event: IdentityStored): void {
  processEvent(event, "IdentityStored");
}
