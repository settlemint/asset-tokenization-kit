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
} from "../../generated/templates/IdentityRegistryStorage/IdentityRegistryStorage";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

/**
 * Handles the CountryModified event by delegating processing to the shared event handler.
 *
 * @param event - The CountryModified event to process.
 */
export function handleCountryModified(event: CountryModified): void {
  processEvent(event, "CountryModified");
}

/**
 * Handles the IdentityModified event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityModified event to process.
 */
export function handleIdentityModified(event: IdentityModified): void {
  processEvent(event, "IdentityModified");
}

/**
 * Handles the IdentityRegistryBound event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityRegistryBound event to process.
 */
export function handleIdentityRegistryBound(
  event: IdentityRegistryBound
): void {
  processEvent(event, "IdentityRegistryBound");
}

/**
 * Handles the unbinding of an identity registry by delegating the event to the event processor.
 *
 * @param event - The IdentityRegistryUnbound event to process.
 */
export function handleIdentityRegistryUnbound(
  event: IdentityRegistryUnbound
): void {
  processEvent(event, "IdentityRegistryUnbound");
}

/**
 * Handles the IdentityStored event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityStored event to process.
 */
export function handleIdentityStored(event: IdentityStored): void {
  processEvent(event, "IdentityStored");
}

/**
 * Handles the IdentityUnstored event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityUnstored event to process.
 */
export function handleIdentityUnstored(event: IdentityUnstored): void {
  processEvent(event, "IdentityUnstored");
}

/**
 * Handles the Initialized event by delegating processing to the shared event handler.
 *
 * @param event - The Initialized event to process.
 */
export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

/**
 * Handles the RoleAdminChanged event by delegating to the role admin change handler.
 *
 * @param event - The RoleAdminChanged event containing details of the role administration change.
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
 * Handles a RoleRevoked event by delegating to the role revocation handler.
 *
 * @param event - The RoleRevoked event containing the role and account information.
 */
export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}
