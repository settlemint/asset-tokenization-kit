import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";

import {
  BondFactory as BondFactoryTemplate,
  FixedYieldScheduleFactory as FixedYieldScheduleFactoryTemplate,
  FundFactory as FundFactoryTemplate,
  VaultFactory as VaultFactoryTemplate,
  XvPSettlementFactory as XvPSettlementFactoryTemplate,
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

  system.compliance = fetchCompliance(event.params.complianceProxy).id;
  system.identityRegistry = identityRegistry.id;
  system.identityRegistryStorage = identityRegistryStorage.id;
  system.trustedIssuersRegistry = trustedIssuersRegistry.id;
  system.identityFactory = identityFactory.id;
  system.topicSchemeRegistry = topicSchemeRegistry.id;
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
  tokenFactory.name = event.params.name;
  tokenFactory.typeId = event.params.typeId;

  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKBondFactory"))
  ) {
    BondFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKFundFactory"))
  ) {
    FundFactoryTemplate.create(event.params.proxyAddress);
  }

  tokenFactory.system = fetchSystem(event.address).id;
  tokenFactory.save();
}

export function handleSystemAddonCreated(event: SystemAddonCreated): void {
  fetchEvent(event, "SystemAddonCreated");
  const systemAddon = fetchSystemAddon(event.params.proxyAddress);
  if (systemAddon.deployedInTransaction.equals(Bytes.empty())) {
    systemAddon.deployedInTransaction = event.transaction.hash;
  }
  systemAddon.name = event.params.name;
  systemAddon.typeId = event.params.typeId;
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKFixedYieldScheduleFactory"))
  ) {
    FixedYieldScheduleFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKXvPSettlementFactory"))
  ) {
    XvPSettlementFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKVaultFactory"))
  ) {
    VaultFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKVestingAirdropFactory"))
  ) {
    VestingAirdropFactoryTemplate.create(event.params.proxyAddress);
  }
  if (
    event.params.typeId ==
    crypto.keccak256(ByteArray.fromUTF8("ATKPushAirdropFactory"))
  ) {
    PushAirdropFactoryTemplate.create(event.params.proxyAddress);
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
