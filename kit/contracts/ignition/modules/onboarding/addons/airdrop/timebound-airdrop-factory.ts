import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingTimeBoundAirdropFactoryModule = buildModule(
  "ATKOnboardingTimeBoundAirdropFactoryModule",
  (m) => {
    const { system, systemAddonRegistry, systemAccessManager } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { timeBoundAirdropFactoryImplementation } = m.useModule(ATKModule);

    const encodedInitializationData = m.encodeFunctionCall(
      timeBoundAirdropFactoryImplementation,
      "initialize",
      [systemAccessManager.address, system.address]
    );

    const createTimeBoundAirdropFactoryAddon = m.call(
      systemAddonRegistry,
      "registerSystemAddon",
      [
        "timeBound-airdrop-factory",
        timeBoundAirdropFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const timeBoundAirdropFactoryAddress = m.readEventArgument(
      createTimeBoundAirdropFactoryAddon,
      "SystemAddonRegistered",
      "proxyAddress",
      { id: "timeBoundAirdropFactoryAddress" }
    );
    const timeBoundAirdropFactoryProxy = m.contractAt(
      "IATKTimeBoundAirdropFactory",
      timeBoundAirdropFactoryAddress,
      {
        id: "timeBoundAirdropFactory",
      }
    );

    return {
      timeBoundAirdropFactory: timeBoundAirdropFactoryProxy,
    };
  }
);

export default ATKOnboardingTimeBoundAirdropFactoryModule;
