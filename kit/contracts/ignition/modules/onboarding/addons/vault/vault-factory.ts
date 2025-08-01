import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingVaultFactoryModule = buildModule(
  "ATKOnboardingVaultFactoryModule",
  (m) => {
    const { system, systemAddonRegistry, systemAccessManager } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { vaultFactoryImplementation } = m.useModule(ATKModule);

    const encodedInitializationData = m.encodeFunctionCall(
      vaultFactoryImplementation,
      "initialize",
      [systemAccessManager.address, system.address]
    );

    const createVaultFactoryAddon = m.call(
      systemAddonRegistry,
      "registerSystemAddon",
      ["vault-factory", vaultFactoryImplementation, encodedInitializationData]
    );
    const vaultFactoryAddress = m.readEventArgument(
      createVaultFactoryAddon,
      "SystemAddonRegistered",
      "proxyAddress",
      { id: "vaultFactoryAddress" }
    );
    const vaultFactoryProxy = m.contractAt(
      "IATKVaultFactory",
      vaultFactoryAddress,
      {
        id: "vaultFactory",
      }
    );

    return {
      vaultFactory: vaultFactoryProxy,
    };
  }
);

export default ATKOnboardingVaultFactoryModule;
