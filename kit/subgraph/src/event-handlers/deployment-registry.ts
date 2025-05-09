import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SMARTComplianceModuleRegistered,
  SMARTDeploymentRegistered,
  SMARTDeploymentReset,
  SMARTTokenRegistryRegistered,
} from "../../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry";

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

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
