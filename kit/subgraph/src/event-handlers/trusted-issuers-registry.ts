import {
  ClaimTopicsUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TrustedIssuerAdded,
  TrustedIssuerRemoved,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
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

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdated): void {
  processEvent(event, "ClaimTopicsUpdated");
}

export function handleTrustedIssuerAdded(event: TrustedIssuerAdded): void {
  processEvent(event, "TrustedIssuerAdded");
}

export function handleTrustedIssuerRemoved(event: TrustedIssuerRemoved): void {
  processEvent(event, "TrustedIssuerRemoved");
}
