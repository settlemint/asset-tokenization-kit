import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ComplianceModule from "./implementations/compliance";
import ConfigurationModule from "./implementations/configuration";
import IdentityFactoryModule from "./implementations/identity-factory";
import IdentityRegistryModule from "./implementations/identity-registry";
import IdentityRegistryStorageModule from "./implementations/identity-registry-storage";
import TokenRegistryModule from "./implementations/token-registry";
import TrustedIssuersRegistryModule from "./implementations/trusted-issuer-registry";
import AssetTokenizationModule from "./main";

const AssetTokenizationOnboardingModule = buildModule(
  "AssetTokenizationOnboardingModule",
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
    const { identityFactory } = m.useModule(IdentityFactoryModule);
    m.useModule(ConfigurationModule);

    const { tokenRegistry } = m.useModule(TokenRegistryModule);

    const registerDeployment = m.call(
      deploymentRegistry,
      "registerDeployment",
      [
        compliance,
        identityRegistryStorage,
        identityFactory,
        identityRegistry,
        trustedIssuersRegistry,
      ],
      {
        id: "RegisterDeployment",
      }
    );

    m.call(
      deploymentRegistry,
      "registerTokenRegistry",
      ["deposit", tokenRegistry],
      {
        after: [registerDeployment],
      }
    );

    return {
      forwarder,
      deploymentRegistry,
      identityRegistryStorage,
      trustedIssuersRegistry,
      compliance,
      identityRegistry,
      identityFactory,
    };
  }
);

export default AssetTokenizationOnboardingModule;
