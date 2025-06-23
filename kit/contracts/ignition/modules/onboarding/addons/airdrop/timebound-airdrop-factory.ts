import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingTimeBoundAirdropFactoryModule = buildModule(
  "ATKOnboardingTimeBoundAirdropFactoryModule",
  (m) => {
    const { system, systemAddonRegistry } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { timeBoundAirdropFactoryImplementation } = m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    const encodedInitializationData = m.encodeFunctionCall(
      timeBoundAirdropFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
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
