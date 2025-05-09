import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SMARTComplianceModuleRegistered,
  SMARTDeploymentRegistered,
  SMARTDeploymentReset,
  SMARTTokenRegistryRegistered,
} from "../../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  roleAdminChangedHandler(event);
}

export function handleRoleGranted(event: RoleGranted): void {
  roleGrantedHandler(event, event.params.role, event.params.account);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  roleRevokedHandler(event, event.params.role, event.params.account);
}

export function handleSMARTComplianceModuleRegistered(
  event: SMARTComplianceModuleRegistered
): void {}

export function handleSMARTDeploymentRegistered(
  event: SMARTDeploymentRegistered
): void {}

export function handleSMARTDeploymentReset(event: SMARTDeploymentReset): void {}

export function handleSMARTTokenRegistryRegistered(
  event: SMARTTokenRegistryRegistered
): void {}
