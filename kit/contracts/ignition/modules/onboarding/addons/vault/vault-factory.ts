import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingVaultFactoryModule = buildModule(
  "ATKOnboardingVaultFactoryModule",
  (m) => {
    const { system, systemAddonRegistry } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { vaultFactoryImplementation } = m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    const encodedInitializationData = m.encodeFunctionCall(
      vaultFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
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
