import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ComplianceModule from "./implementations/compliance";
import ConfigurationModule from "./implementations/configuration";
import IdentityRegistryModule from "./implementations/identity-registry";
import IdentityRegistryStorageModule from "./implementations/identity-registry-storage";
import TrustedIssuersRegistryModule from "./implementations/trusted-issuer-registry";
import AssetTokenizationModule from "./main";
const AssetTokenizationTestModule = buildModule(
  "AssetTokenizationTestModule",
  (m) => {
    const { forwarder, deploymentRegistry } = m.useModule(
      AssetTokenizationModule
    );
    const { identityRegistryStorage } = m.useModule(
      IdentityRegistryStorageModule
    );
    const { trustedIssuersRegistry } = m.useModule(
      TrustedIssuersRegistryModule
    );
    const { compliance } = m.useModule(ComplianceModule);
    const { identityRegistry } = m.useModule(IdentityRegistryModule);
    m.useModule(ConfigurationModule);

    return {
      forwarder,
      deploymentRegistry,
      identityRegistryStorage,
      trustedIssuersRegistry,
      compliance,
      identityRegistry,
    };
  }
);

export default AssetTokenizationTestModule;
