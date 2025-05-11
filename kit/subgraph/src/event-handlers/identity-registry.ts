import {
  CountryUpdated,
  IdentityRegistered,
  IdentityRemoved,
  IdentityUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/IdentityRegistry/IdentityRegistry";
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

export function handleCountryUpdated(event: CountryUpdated): void {
  processEvent(event, "CountryUpdated");
}

export function handleIdentityRegistered(event: IdentityRegistered): void {
  processEvent(event, "IdentityRegistered");
}

export function handleIdentityRemoved(event: IdentityRemoved): void {
  processEvent(event, "IdentityRemoved");
}

export function handleIdentityUpdated(event: IdentityUpdated): void {
  processEvent(event, "IdentityUpdated");
}
