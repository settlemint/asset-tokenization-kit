import {
  Bootstrapped,
  ComplianceImplementationUpdated,
  EtherWithdrawn,
  IdentityFactoryImplementationUpdated,
  IdentityImplementationUpdated,
  IdentityRegistryImplementationUpdated,
  IdentityRegistryStorageImplementationUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityImplementationUpdated,
  TrustedIssuersRegistryImplementationUpdated,
} from "../../generated/templates/System/System";
import { fetchCompliance } from "../fetch/compliance";
import { fetchSystem } from "../fetch/system";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

export function handleBootstrapped(event: Bootstrapped): void {
  processEvent(event, "Bootstrapped");
  const system = fetchSystem(event.address);
  const compliance = fetchCompliance(event.params.complianceProxy);
  system.compliance = compliance.id;
  system.save();
}

export function handleComplianceImplementationUpdated(
  event: ComplianceImplementationUpdated
): void {
  processEvent(event, "ComplianceImplementationUpdated");
  const system = fetchSystem(event.address);
  system.compliance = fetchCompliance(event.params.newImplementation).id;
  system.save();
}

export function handleEtherWithdrawn(event: EtherWithdrawn): void {
  processEvent(event, "EtherWithdrawn");
}

export function handleIdentityFactoryImplementationUpdated(
  event: IdentityFactoryImplementationUpdated
): void {
  processEvent(event, "IdentityFactoryImplementationUpdated");
}

export function handleIdentityImplementationUpdated(
  event: IdentityImplementationUpdated
): void {
  processEvent(event, "IdentityImplementationUpdated");
}

export function handleIdentityRegistryImplementationUpdated(
  event: IdentityRegistryImplementationUpdated
): void {
  processEvent(event, "IdentityRegistryImplementationUpdated");
}

export function handleIdentityRegistryStorageImplementationUpdated(
  event: IdentityRegistryStorageImplementationUpdated
): void {
  processEvent(event, "IdentityRegistryStorageImplementationUpdated");
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

export function handleTokenIdentityImplementationUpdated(
  event: TokenIdentityImplementationUpdated
): void {
  processEvent(event, "TokenIdentityImplementationUpdated");
}

export function handleTrustedIssuersRegistryImplementationUpdated(
  event: TrustedIssuersRegistryImplementationUpdated
): void {
  processEvent(event, "TrustedIssuersRegistryImplementationUpdated");
}
