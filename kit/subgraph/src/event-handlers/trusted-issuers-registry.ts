import { RoleRevoked } from "../../generated/templates/System/System";
import {
  ClaimTopicsUpdated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  TrustedIssuerAdded,
  TrustedIssuerRemoved,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

/**
 * Handles the ClaimTopicsUpdated event by delegating processing to the generic event handler.
 *
 * @param event - The ClaimTopicsUpdated event to process.
 */
export function handleClaimTopicsUpdated(event: ClaimTopicsUpdated): void {
  processEvent(event, "ClaimTopicsUpdated");
}

/**
 * Handles the Initialized event by delegating processing to the generic event handler.
 *
 * @param event - The Initialized event to process.
 */
export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

/**
 * Handles the RoleAdminChanged event by delegating to the shared role admin change handler.
 *
 * @param event - The RoleAdminChanged event to process.
 */
export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

/**
 * Handles the RoleGranted event by delegating to the shared roleGrantedHandler.
 *
 * @param event - The RoleGranted event containing role and account information.
 */
export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

/**
 * Handles the RoleRevoked event by delegating to the shared role revocation handler.
 *
 * @param event - The RoleRevoked event containing details about the revoked role and affected account.
 */
export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}
/**
 * Handles the TrustedIssuerAdded event by delegating processing to the generic event handler.
 *
 * @param event - The TrustedIssuerAdded event to process.
 */
export function handleTrustedIssuerAdded(event: TrustedIssuerAdded): void {
  processEvent(event, "TrustedIssuerAdded");
}

/**
 * Handles the removal of a trusted issuer by processing the corresponding event.
 *
 * @param event - The TrustedIssuerRemoved event to process.
 */
export function handleTrustedIssuerRemoved(event: TrustedIssuerRemoved): void {
  processEvent(event, "TrustedIssuerRemoved");
}
