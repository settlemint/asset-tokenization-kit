import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingVestingAirdropFactoryModule = buildModule(
  "ATKOnboardingVestingAirdropFactoryModule",
  (m) => {
    const { system, systemAddonRegistry, systemAccessManager } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { vestingAirdropFactoryImplementation } = m.useModule(ATKModule);

    const encodedInitializationData = m.encodeFunctionCall(
      vestingAirdropFactoryImplementation,
      "initialize",
      [systemAccessManager.address, system.address]
    );

    const createVestingAirdropFactoryAddon = m.call(
      systemAddonRegistry,
      "registerSystemAddon",
      [
        "vesting-airdrop-factory",
        vestingAirdropFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const vestingAirdropFactoryAddress = m.readEventArgument(
      createVestingAirdropFactoryAddon,
      "SystemAddonRegistered",
      "proxyAddress",
      { id: "vestingAirdropFactoryAddress" }
    );
    const vestingAirdropFactoryProxy = m.contractAt(
      "IATKVestingAirdropFactory",
      vestingAirdropFactoryAddress,
      {
        id: "vestingAirdropFactory",
      }
    );

    return {
      vestingAirdropFactory: vestingAirdropFactoryProxy,
    };
  }
);

export default ATKOnboardingVestingAirdropFactoryModule;
