import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SMARTComplianceModuleRegistered,
  SMARTDeploymentRegistered,
  SMARTDeploymentReset,
  SMARTTokenRegistryRegistered,
} from "../../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry";
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
  fetchDeploymentRegistry(event.address);
  roleAdminChangedHandler(event);
}

export function handleRoleGranted(event: RoleGranted): void {
  fetchDeploymentRegistry(event.address);
  roleGrantedHandler(event, event.params.role, event.params.account);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  fetchDeploymentRegistry(event.address);
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

  const identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageAddress
  );
  deploymentRegistry.identityRegistryStorage = identityRegistryStorage.id;

  const identityFactory = fetchIdentityFactory(
    event.params.identityFactoryAddress
  );
  deploymentRegistry.identityFactory = identityFactory.id;

  const identityRegistry = fetchIdentityRegistry(
    event.params.identityRegistryAddress
  );
  deploymentRegistry.identityRegistry = identityRegistry.id;

  const trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.trustedIssuersRegistryAddress
  );
  deploymentRegistry.trustedIssuersRegistry = trustedIssuersRegistry.id;

  deploymentRegistry.save();
}

export function handleSMARTDeploymentReset(event: SMARTDeploymentReset): void {
  processEvent(event, "DeploymentReset");
  const deploymentRegistry = fetchDeploymentRegistry(event.address);

  deploymentRegistry.compliance = null;
  deploymentRegistry.identityRegistryStorage = null;
  deploymentRegistry.identityFactory = null;
  deploymentRegistry.identityRegistry = null;
  deploymentRegistry.trustedIssuersRegistry = null;

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
