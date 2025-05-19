import {
  IdentityCreated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { fetchIdentity } from "../fetch/identity";
import { fetchTokenIdentity } from "../fetch/token-identity";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

export function handleIdentityCreated(event: IdentityCreated): void {
  processEvent(event, "IdentityCreated");
  fetchIdentity(event.params.identity);
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

export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {
  processEvent(event, "TokenIdentityCreated");
  fetchTokenIdentity(event.params.identity);
}
