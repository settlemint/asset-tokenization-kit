import { Bytes } from "@graphprotocol/graph-ts";

import {
  Bootstrapped,
  ComplianceImplementationUpdated,
  ComplianceModuleRegistryImplementationUpdated,
  ContractIdentityImplementationUpdated,
  IdentityFactoryImplementationUpdated,
  IdentityImplementationUpdated,
  IdentityRegistryImplementationUpdated,
  IdentityRegistryStorageImplementationUpdated,
  SystemAccessManagerImplementationUpdated,
  SystemAddonRegistryImplementationUpdated,
  TokenAccessManagerImplementationUpdated,
  TokenFactoryRegistryImplementationUpdated,
  TopicSchemeRegistryImplementationUpdated,
  TrustedIssuersRegistryImplementationUpdated,
} from "../../generated/templates/System/System";
import { fetchCompliance } from "../compliance/fetch/compliance";
import { fetchComplianceModuleRegistry } from "../compliance/fetch/compliance-module-registry";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityFactory } from "../identity-factory/fetch/identity-factory";
import { fetchIdentityRegistry } from "../identity-registry/fetch/identity-registry";
import { fetchIdentityRegistryStorage } from "../identity-registry/fetch/identity-registry-storage";
import { fetchSystemAddonRegistry } from "../system-addons/fetch/system-addon-registry";
import { fetchTokenFactoryRegistry } from "../token-factory/fetch/token-factory-registry";
import { fetchTopicSchemeRegistry } from "../topic-scheme-registry/fetch/topic-scheme-registry";
import { fetchSystem } from "./fetch/system";
import { fetchSystemAccessManager } from "./fetch/system-access-manager";
import { fetchTrustedIssuersRegistry } from "./fetch/trusted-issuers-registry";

export function handleBootstrapped(event: Bootstrapped): void {
  fetchEvent(event, "Bootstrapped");
  const system = fetchSystem(event.address);

  // Set deployedInTransaction for all entities created during bootstrap
  const identityRegistry = fetchIdentityRegistry(
    event.params.identityRegistryProxy
  );
  if (identityRegistry.deployedInTransaction.equals(Bytes.empty())) {
    identityRegistry.deployedInTransaction = event.transaction.hash;
  }
  identityRegistry.save();

  const identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageProxy
  );
  if (identityRegistryStorage.deployedInTransaction.equals(Bytes.empty())) {
    identityRegistryStorage.deployedInTransaction = event.transaction.hash;
  }
  identityRegistryStorage.save();

  const trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.trustedIssuersRegistryProxy
  );
  if (trustedIssuersRegistry.deployedInTransaction.equals(Bytes.empty())) {
    trustedIssuersRegistry.deployedInTransaction = event.transaction.hash;
  }
  trustedIssuersRegistry.save();

  const identityFactory = fetchIdentityFactory(
    event.params.identityFactoryProxy
  );
  if (identityFactory.deployedInTransaction.equals(Bytes.empty())) {
    identityFactory.deployedInTransaction = event.transaction.hash;
  }
  identityFactory.save();

  const topicSchemeRegistry = fetchTopicSchemeRegistry(
    event.params.topicSchemeRegistryProxy
  );
  if (topicSchemeRegistry.deployedInTransaction.equals(Bytes.empty())) {
    topicSchemeRegistry.deployedInTransaction = event.transaction.hash;
  }
  topicSchemeRegistry.save();

  const tokenFactoryRegistry = fetchTokenFactoryRegistry(
    event.params.tokenFactoryRegistryProxy
  );
  if (tokenFactoryRegistry.deployedInTransaction.equals(Bytes.empty())) {
    tokenFactoryRegistry.deployedInTransaction = event.transaction.hash;
  }
  tokenFactoryRegistry.system = system.id;
  tokenFactoryRegistry.save();

  const complianceModuleRegistry = fetchComplianceModuleRegistry(
    event.params.complianceModuleRegistryProxy
  );
  if (complianceModuleRegistry.deployedInTransaction.equals(Bytes.empty())) {
    complianceModuleRegistry.deployedInTransaction = event.transaction.hash;
  }
  complianceModuleRegistry.save();

  const systemAddonRegistry = fetchSystemAddonRegistry(
    event.params.systemAddonRegistryProxy
  );
  if (systemAddonRegistry.deployedInTransaction.equals(Bytes.empty())) {
    systemAddonRegistry.deployedInTransaction = event.transaction.hash;
  }
  systemAddonRegistry.save();

  const systemAccessManager = fetchSystemAccessManager(
    event.params.systemAccessManagerProxy
  );
  if (systemAccessManager.deployedInTransaction.equals(Bytes.empty())) {
    systemAccessManager.deployedInTransaction = event.transaction.hash;
  }
  systemAccessManager.system = system.id;
  systemAccessManager.save();

  system.compliance = fetchCompliance(event.params.complianceProxy).id;
  system.identityRegistry = identityRegistry.id;
  system.identityRegistryStorage = identityRegistryStorage.id;
  system.trustedIssuersRegistry = trustedIssuersRegistry.id;
  system.identityFactory = identityFactory.id;
  system.topicSchemeRegistry = topicSchemeRegistry.id;
  system.tokenFactoryRegistry = tokenFactoryRegistry.id;
  system.complianceModuleRegistry = complianceModuleRegistry.id;
  system.systemAddonRegistry = systemAddonRegistry.id;
  system.systemAccessManager = systemAccessManager.id;
  system.save();
}

export function handleComplianceImplementationUpdated(
  event: ComplianceImplementationUpdated
): void {
  fetchEvent(event, "ComplianceImplementationUpdated");
}

export function handleIdentityFactoryImplementationUpdated(
  event: IdentityFactoryImplementationUpdated
): void {
  fetchEvent(event, "IdentityFactoryImplementationUpdated");
}

export function handleIdentityImplementationUpdated(
  event: IdentityImplementationUpdated
): void {
  fetchEvent(event, "IdentityImplementationUpdated");
}

export function handleIdentityRegistryImplementationUpdated(
  event: IdentityRegistryImplementationUpdated
): void {
  fetchEvent(event, "IdentityRegistryImplementationUpdated");
}

export function handleIdentityRegistryStorageImplementationUpdated(
  event: IdentityRegistryStorageImplementationUpdated
): void {
  fetchEvent(event, "IdentityRegistryStorageImplementationUpdated");
}

export function handleTokenAccessManagerImplementationUpdated(
  event: TokenAccessManagerImplementationUpdated
): void {
  fetchEvent(event, "TokenAccessManagerImplementationUpdated");
}

export function handleContractIdentityImplementationUpdated(
  event: ContractIdentityImplementationUpdated
): void {
  fetchEvent(event, "ContractIdentityImplementationUpdated");
}

export function handleTrustedIssuersRegistryImplementationUpdated(
  event: TrustedIssuersRegistryImplementationUpdated
): void {
  fetchEvent(event, "TrustedIssuersRegistryImplementationUpdated");
}

export function handleTopicSchemeRegistryImplementationUpdated(
  event: TopicSchemeRegistryImplementationUpdated
): void {
  fetchEvent(event, "TopicSchemeRegistryImplementationUpdated");
}

export function handleTokenFactoryRegistryImplementationUpdated(
  event: TokenFactoryRegistryImplementationUpdated
): void {
  fetchEvent(event, "TokenFactoryRegistryImplementationUpdated");
}

export function handleComplianceModuleRegistryImplementationUpdated(
  event: ComplianceModuleRegistryImplementationUpdated
): void {
  fetchEvent(event, "ComplianceModuleRegistryImplementationUpdated");
}

export function handleSystemAddonRegistryImplementationUpdated(
  event: SystemAddonRegistryImplementationUpdated
): void {
  fetchEvent(event, "SystemAddonRegistryImplementationUpdated");
}

export function handleSystemAccessManagerImplementationUpdated(
  event: SystemAccessManagerImplementationUpdated
): void {
  fetchEvent(event, "SystemAccessManagerImplementationUpdated");
}
