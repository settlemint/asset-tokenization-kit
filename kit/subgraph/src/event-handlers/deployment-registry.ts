import {
  SMARTComplianceModuleRegistered,
  SMARTDeploymentRegistered,
  SMARTTokenRegistryRegistered,
} from "../../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry";
import {
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
import { processEvent } from "../shared/event";

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
  // No need to create compliance template as it is not trowing any useful events

  const identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageAddress
  );
  deploymentRegistry.identityRegistryStorage = identityRegistryStorage.id;
  IdentityRegistryStorage.create(event.params.identityRegistryStorageAddress);

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
