import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenRegistered,
  TokenUnregistered,
} from "../../generated/templates/TokenRegistry/TokenRegistry";
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

export function handleTokenRegistered(event: TokenRegistered): void {
  processEvent(event, "TokenRegistered");
}

export function handleTokenUnregistered(event: TokenUnregistered): void {
  processEvent(event, "TokenUnregistered");
}
