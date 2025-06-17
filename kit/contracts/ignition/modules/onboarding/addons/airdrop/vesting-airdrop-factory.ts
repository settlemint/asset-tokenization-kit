import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingVestingAirdropFactoryModule = buildModule(
  "ATKOnboardingVestingAirdropFactoryModule",
  (m) => {
    const { system } = m.useModule(ATKOnboardingSystemModule);
    const { vestingAirdropFactoryImplementation } = m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    const encodedInitializationData = m.encodeFunctionCall(
      vestingAirdropFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
    );

    const createVestingAirdropFactoryAddon = m.call(
      system,
      "createSystemAddon",
      [
        "vesting-airdrop-factory",
        vestingAirdropFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const vestingAirdropFactoryAddress = m.readEventArgument(
      createVestingAirdropFactoryAddon,
      "SystemAddonCreated",
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
