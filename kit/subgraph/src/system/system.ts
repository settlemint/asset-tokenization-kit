import {
  BondFactory as BondFactoryTemplate,
  FixedYieldScheduleFactory as FixedYieldScheduleFactoryTemplate,
  FundFactory as FundFactoryTemplate,
} from "../../generated/templates";
import {
  Bootstrapped,
  ComplianceImplementationUpdated,
  IdentityFactoryImplementationUpdated,
  IdentityImplementationUpdated,
  IdentityRegistryImplementationUpdated,
  IdentityRegistryStorageImplementationUpdated,
  SystemAddonCreated,
  TokenAccessManagerImplementationUpdated,
  TokenFactoryCreated,
  TokenIdentityImplementationUpdated,
  TopicSchemeRegistryImplementationUpdated,
  TrustedIssuersRegistryImplementationUpdated,
} from "../../generated/templates/System/System";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityFactory } from "../identity-factory/fetch/identity-factory";
import { fetchIdentityRegistry } from "../identity-registry/fetch/identity-registry";
import { fetchIdentityRegistryStorage } from "../identity-registry/fetch/identity-registry-storage";
import { fetchTokenFactory } from "../token-factory/fetch/token-factory";
import { fetchTopicSchemeRegistry } from "../topic-scheme-registry/fetch/topic-scheme-registry";
import { fetchCompliance } from "./fetch/compliance";
import { fetchSystem } from "./fetch/system";
import { fetchSystemAddon } from "./fetch/system-addon";
import { fetchTrustedIssuersRegistry } from "./fetch/trusted-issuers-registry";

import { InterfaceIds } from "../erc165/utils/interfaceids";
import { checkSupportsInterface } from "../generic-erc165/generic-erc165";

export function handleBootstrapped(event: Bootstrapped): void {
  fetchEvent(event, "Bootstrapped");
  const system = fetchSystem(event.address);
  system.compliance = fetchCompliance(event.params.complianceProxy).id;
  system.identityRegistry = fetchIdentityRegistry(
    event.params.identityRegistryProxy
  ).id;
  system.identityRegistryStorage = fetchIdentityRegistryStorage(
    event.params.identityRegistryStorageProxy
  ).id;
  system.trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.trustedIssuersRegistryProxy
  ).id;
  system.identityFactory = fetchIdentityFactory(
    event.params.identityFactoryProxy
  ).id;
  system.topicSchemeRegistry = fetchTopicSchemeRegistry(
    event.params.topicSchemeRegistryProxy
  ).id;
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

export function handleTokenFactoryCreated(event: TokenFactoryCreated): void {
  fetchEvent(event, "TokenFactoryCreated");
  const tokenFactory = fetchTokenFactory(event.params.proxyAddress);
  tokenFactory.type = event.params.typeName;

  if (
    checkSupportsInterface(
      event.params.implementationAddress,
      InterfaceIds.IATKBondFactory
    )
  ) {
    BondFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    checkSupportsInterface(
      event.params.implementationAddress,
      InterfaceIds.IATKFundFactory
    )
  ) {
    FundFactoryTemplate.create(event.params.proxyAddress);
  }

  tokenFactory.system = fetchSystem(event.address).id;
  tokenFactory.save();
}

export function handleSystemAddonCreated(event: SystemAddonCreated): void {
  fetchEvent(event, "SystemAddonCreated");
  const systemAddon = fetchSystemAddon(event.params.proxyAddress);
  systemAddon.type = event.params.typeName;
  if (
    checkSupportsInterface(
      event.params.proxyAddress,
      InterfaceIds.IATKFixedYieldScheduleFactory
    )
  ) {
    FixedYieldScheduleFactoryTemplate.create(event.params.proxyAddress);
  }
  systemAddon.system = fetchSystem(event.address).id;
  systemAddon.save();
}

export function handleTokenIdentityImplementationUpdated(
  event: TokenIdentityImplementationUpdated
): void {
  fetchEvent(event, "TokenIdentityImplementationUpdated");
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
