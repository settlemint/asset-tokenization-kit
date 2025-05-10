import {
  ClaimTopicsUpdated,
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TrustedIssuerAdded,
  TrustedIssuerRemoved,
  Upgraded,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { processEvent } from "../shared/event";

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdated): void {
  processEvent(event, "ClaimTopicsUpdated");
}

export function handleDefaultAdminDelayChangeCanceled(
  event: DefaultAdminDelayChangeCanceled
): void {
  processEvent(event, "DefaultAdminDelayChangeCanceled");
}

export function handleDefaultAdminDelayChangeScheduled(
  event: DefaultAdminDelayChangeScheduled
): void {
  processEvent(event, "DefaultAdminDelayChangeScheduled");
}

export function handleDefaultAdminTransferCanceled(
  event: DefaultAdminTransferCanceled
): void {
  processEvent(event, "DefaultAdminTransferCanceled");
}

export function handleDefaultAdminTransferScheduled(
  event: DefaultAdminTransferScheduled
): void {
  processEvent(event, "DefaultAdminTransferScheduled");
}

export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  processEvent(event, "RoleAdminChanged");
}

export function handleRoleGranted(event: RoleGranted): void {
  processEvent(event, "RoleGranted");
}

export function handleRoleRevoked(event: RoleRevoked): void {
  processEvent(event, "RoleRevoked");
}

export function handleTrustedIssuerAdded(event: TrustedIssuerAdded): void {
  processEvent(event, "TrustedIssuerAdded");
}

export function handleTrustedIssuerRemoved(event: TrustedIssuerRemoved): void {
  processEvent(event, "TrustedIssuerRemoved");
}

export function handleUpgraded(event: Upgraded): void {
  processEvent(event, "Upgraded");
}
