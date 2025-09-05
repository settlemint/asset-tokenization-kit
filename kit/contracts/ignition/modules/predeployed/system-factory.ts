import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ComplianceModule from "./compliance";
import ComplianceModuleRegistryModule from "./compliance-module-registry";
import ForwarderModule from "./forwarder";
import IdentityModule from "./identity";
import IdentityFactoryModule from "./identity-factory";
import IdentityRegistryModule from "./identity-registry";
import IdentityRegistryStorageModule from "./identity-registry-storage";
import SystemModule from "./system";
import SystemAccessManagerModule from "./system-access-manager";
import SystemAddonRegistryModule from "./system-addon-registry";
import SystemTrustedIssuerRegistryModule from "./system-trusted-issuer-registry";
import TokenAccessManagerModule from "./token-access-manager";
import TokenFactoryRegistryModule from "./token-factory-registry";
import TopicSchemeRegistryModule from "./topic-scheme-registry";
import TrustedIssuersMetaRegistryModule from "./trusted-issuers-meta-registry";

const SystemFactoryModule = buildModule("SystemFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { system } = m.useModule(SystemModule);
  const { compliance } = m.useModule(ComplianceModule);
  const { identityRegistry } = m.useModule(IdentityRegistryModule);
  const { identityRegistryStorage } = m.useModule(
    IdentityRegistryStorageModule
  );
  const { systemTrustedIssuerRegistry } = m.useModule(
    SystemTrustedIssuerRegistryModule
  );
  const { trustedIssuersMetaRegistry } = m.useModule(
    TrustedIssuersMetaRegistryModule
  );
  const { topicSchemeRegistry } = m.useModule(TopicSchemeRegistryModule);
  const { identityFactory } = m.useModule(IdentityFactoryModule);
  const { identity, contractIdentity } = m.useModule(IdentityModule);
  const { tokenAccessManager } = m.useModule(TokenAccessManagerModule);

  const { tokenFactoryRegistry } = m.useModule(TokenFactoryRegistryModule);
  const { complianceModuleRegistry } = m.useModule(
    ComplianceModuleRegistryModule
  );
  const { systemAddonRegistry } = m.useModule(SystemAddonRegistryModule);
  const { systemAccessManager } = m.useModule(SystemAccessManagerModule);

  const systemFactory = m.contract("ATKSystemFactory", [
    system,
    compliance,
    identityRegistry,
    identityRegistryStorage,
    systemTrustedIssuerRegistry,
    trustedIssuersMetaRegistry,
    topicSchemeRegistry,
    identityFactory,
    identity,
    contractIdentity,
    tokenAccessManager,
    tokenFactoryRegistry,
    complianceModuleRegistry,
    systemAddonRegistry,
    systemAccessManager,
    forwarder,
  ]);

  return { systemFactory };
});

export default SystemFactoryModule;
