import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingTimeboundAirdropFactoryModule = buildModule(
  "ATKOnboardingTimeboundAirdropFactoryModule",
  (m) => {
    const { system, systemAddonRegistry } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { timeboundAirdropFactoryImplementation } = m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    const encodedInitializationData = m.encodeFunctionCall(
      timeboundAirdropFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
    );

    const createTimeboundAirdropFactoryAddon = m.call(
      systemAddonRegistry,
      "registerSystemAddon",
      [
        "timebound-airdrop-factory",
        timeboundAirdropFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const timeboundAirdropFactoryAddress = m.readEventArgument(
      createTimeboundAirdropFactoryAddon,
      "SystemAddonRegistered",
      "proxyAddress",
      { id: "timeboundAirdropFactoryAddress" }
    );
    const timeboundAirdropFactoryProxy = m.contractAt(
      "IATKTimeboundAirdropFactory",
      timeboundAirdropFactoryAddress,
      {
        id: "timeboundAirdropFactory",
      }
    );

    return {
      timeboundAirdropFactory: timeboundAirdropFactoryProxy,
    };
  }
);

export default ATKOnboardingTimeboundAirdropFactoryModule;
