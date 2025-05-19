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

/**
 * Handles the CountryUpdated blockchain event by delegating processing to the shared event handler.
 *
 * @param event - The CountryUpdated event to process.
 */
export function handleCountryUpdated(event: CountryUpdated): void {
  processEvent(event, "CountryUpdated");
}

/**
 * Handles the IdentityRegistered event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityRegistered event to process.
 */
export function handleIdentityRegistered(event: IdentityRegistered): void {
  processEvent(event, "IdentityRegistered");
}

/**
 * Handles the IdentityRemoved event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityRemoved event containing details of the removed identity.
 */
export function handleIdentityRemoved(event: IdentityRemoved): void {
  processEvent(event, "IdentityRemoved");
}

/**
 * Handles the IdentityStorageSet event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityStorageSet blockchain event to process.
 */
export function handleIdentityStorageSet(event: IdentityStorageSet): void {
  processEvent(event, "IdentityStorageSet");
}

/**
 * Handles the IdentityUpdated event by delegating processing to the shared event handler.
 *
 * @param event - The IdentityUpdated event containing updated identity information.
 */
export function handleIdentityUpdated(event: IdentityUpdated): void {
  processEvent(event, "IdentityUpdated");
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
 * Handles the RoleAdminChanged event by delegating to the role administration change handler.
 *
 * @param event - The RoleAdminChanged event containing details of the role admin update.
 */
export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

/**
 * Handles the RoleGranted event by delegating to the roleGrantedHandler with the event, role, and account parameters.
 *
 * @param event - The RoleGranted event containing role and account information.
 */
export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

/**
 * Handles the RoleRevoked event by delegating to the role revocation handler.
 *
 * @param event - The RoleRevoked event containing details about the revoked role and affected account.
 */
export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}

/**
 * Handles the TrustedIssuersRegistrySet event by delegating processing to the shared event handler.
 *
 * @param event - The TrustedIssuersRegistrySet event to process.
 */
export function handleTrustedIssuersRegistrySet(
  event: TrustedIssuersRegistrySet
): void {
  processEvent(event, "TrustedIssuersRegistrySet");
}
