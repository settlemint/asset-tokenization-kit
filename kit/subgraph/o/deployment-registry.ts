import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SMARTComplianceModuleRegistered,
  SMARTDeploymentRegistered,
  SMARTTokenRegistryRegistered,
} from "../../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry";
import {
  Compliance,
  IdentityFactory,
  IdentityRegistry,
  IdentityRegistryStorage,
  TrustedIssuersRegistry,
} from "../../generated/templates";
import { fetchCompliance } from "../fetch/system/compliance";
import { fetchDeploymentRegistry } from "../fetch/system/deployment-registry";
import { fetchIdentityFactory } from "../fetch/system/identity-factory";
import { fetchIdentityRegistry } from "../fetch/system/identity-registry";
import { fetchIdentityRegistryStorage } from "../fetch/system/identity-registry-storage";
import { fetchTokenRegistry } from "../fetch/system/token-registry";
import { fetchTrustedIssuersRegistry } from "../fetch/system/trusted-issuers-registry";
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

export function handleSMARTComplianceModuleRegistered(
  event: SMARTComplianceModuleRegistered
): void {
  processEvent(event, "ComplianceModuleRegistered");
  fetchDeploymentRegistry(event.address);
  // TODO: handle compliance module
}

export function handleSMARTDeploymentRegistered(
  event: SMARTDeploymentRegistered
): void {
  processEvent(event, "DeploymentRegistered");
  const deploymentRegistry = fetchDeploymentRegistry(event.address);

  const compliance = fetchCompliance(event.params.complianceAddress);
  deploymentRegistry.compliance = compliance.id;
  Compliance.create(event.params.complianceAddress);

  const identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageAddress
  );
  deploymentRegistry.identityRegistryStorage = identityRegistryStorage.id;
  IdentityRegistryStorage.create(event.params.identityRegistryStorageAddress);

  const identityFactory = fetchIdentityFactory(
    event.params.identityFactoryAddress
  );
  deploymentRegistry.identityFactory = identityFactory.id;
  IdentityFactory.create(event.params.identityFactoryAddress);

  const identityRegistry = fetchIdentityRegistry(
    event.params.identityRegistryAddress
  );
  deploymentRegistry.identityRegistry = identityRegistry.id;
  IdentityRegistry.create(event.params.identityRegistryAddress);

  const trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.trustedIssuersRegistryAddress
  );
  deploymentRegistry.trustedIssuersRegistry = trustedIssuersRegistry.id;
  TrustedIssuersRegistry.create(event.params.trustedIssuersRegistryAddress);

  deploymentRegistry.save();
}

export function handleSMARTTokenRegistryRegistered(
  event: SMARTTokenRegistryRegistered
): void {
  processEvent(event, "TokenRegistryRegistered");
  const deploymentRegistry = fetchDeploymentRegistry(event.address);
  fetchTokenRegistry(
    event.params.registryAddress,
    deploymentRegistry,
    event.params.typeName
  );
}
