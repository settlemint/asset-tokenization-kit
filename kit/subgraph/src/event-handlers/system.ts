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
import { fetchIdentityFactory } from "../fetch/identity-factory";
import { fetchIdentityRegistry } from "../fetch/identity-registry";
import { fetchIdentityRegistryStorage } from "../fetch/identity-registry-storage";
import { fetchSystem } from "../fetch/system";
import { fetchTrustedIssuersRegistry } from "../fetch/trusted-issuers-registry";
import { roleAdminChangedHandler } from "../shared/accesscontrol/role-admin-changed";
import { roleGrantedHandler } from "../shared/accesscontrol/role-granted";
import { roleRevokedHandler } from "../shared/accesscontrol/role-revoked";
import { processEvent } from "../shared/event/event";

export function handleBootstrapped(event: Bootstrapped): void {
  processEvent(event, "Bootstrapped");
  const system = fetchSystem(event.address);
  system.compliance = fetchCompliance(event.params.complianceProxy).id;
  system.identityFactory = fetchIdentityFactory(
    event.params.identityFactoryProxy
  ).id;
  system.identityRegistry = fetchIdentityRegistry(
    event.params.identityRegistryProxy
  ).id;
  system.identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageProxy
  ).id;
  system.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.trustedIssuersRegistryProxy
  ).id;
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
  const system = fetchSystem(event.address);
  system.identityFactory = fetchIdentityFactory(
    event.params.newImplementation
  ).id;
  system.save();
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
  const system = fetchSystem(event.address);
  system.identityRegistry = fetchIdentityRegistry(
    event.params.newImplementation
  ).id;
  system.save();
}

export function handleIdentityRegistryStorageImplementationUpdated(
  event: IdentityRegistryStorageImplementationUpdated
): void {
  processEvent(event, "IdentityRegistryStorageImplementationUpdated");
  const system = fetchSystem(event.address);
  system.identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.newImplementation
  ).id;
  system.save();
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
  const system = fetchSystem(event.address);
  system.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.newImplementation
  ).id;
  system.save();
}
