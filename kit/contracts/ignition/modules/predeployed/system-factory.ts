import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ComplianceModule from "./compliance";
import ForwarderModule from "./forwarder";
import IdentityModule from "./identity";
import IdentityFactoryModule from "./identity-factory";
import IdentityRegistryModule from "./identity-registry";
import IdentityRegistryStorageModule from "./identity-registry-storage";
import TrustedIssuerRegistryModule from "./trusted-issuer-registry";

const SystemFactoryModule = buildModule("SystemFactoryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { compliance } = m.useModule(ComplianceModule);
  const { identityRegistry } = m.useModule(IdentityRegistryModule);
  const { identityRegistryStorage } = m.useModule(
    IdentityRegistryStorageModule
  );
  const { trustedIssuerRegistry } = m.useModule(TrustedIssuerRegistryModule);
  const { identityFactory } = m.useModule(IdentityFactoryModule);
  const { identity, tokenIdentity } = m.useModule(IdentityModule);

  const systemFactory = m.contract("ATKSystemFactory", [
    compliance,
    identityRegistry,
    identityRegistryStorage,
    trustedIssuerRegistry,
    identityFactory,
    identity,
    tokenIdentity,
    forwarder,
  ]);

  return { systemFactory };
});

export default SystemFactoryModule;
