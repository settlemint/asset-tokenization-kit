import {
  IdentityCreated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

/**
 * Handles the IdentityCreated event emitted by the IdentityFactory contract.
 *
 * Delegates processing of the identity creation event to a shared event handler.
 */
export function handleIdentityCreated(event: IdentityCreated): void {
  processEvent(event, "IdentityCreated");
}

/**
 * Handles the Initialized event emitted by the IdentityFactory contract.
 *
 * Delegates processing of the initialization event to a shared event handler.
 */
export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

/**
 * Handles the RoleAdminChanged event by delegating to the shared role administration handler.
 *
 * @param event - The RoleAdminChanged event emitted by the IdentityFactory contract.
 */
export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

/**
 * Handles the RoleGranted event by delegating to the roleGrantedHandler with the event, role, and account.
 */
export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

/**
 * Handles the RoleRevoked event by delegating to the roleRevokedHandler with the event, role, and account.
 */
export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}

/**
 * Handles the TokenIdentityCreated event by delegating processing to a shared event handler.
 *
 * @param event - The TokenIdentityCreated event emitted by the IdentityFactory contract.
 */
export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {
  processEvent(event, "TokenIdentityCreated");
}
