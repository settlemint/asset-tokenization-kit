import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../../main";
import ATKOnboardingSystemModule from "../../system";

const ATKOnboardingPushAirdropFactoryModule = buildModule(
  "ATKOnboardingPushAirdropFactoryModule",
  (m) => {
    const { system, systemAddonRegistry, systemAccessManager } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { pushAirdropFactoryImplementation } = m.useModule(ATKModule);

    const encodedInitializationData = m.encodeFunctionCall(
      pushAirdropFactoryImplementation,
      "initialize",
      [systemAccessManager.address, system.address]
    );

    const createPushAirdropFactoryAddon = m.call(
      systemAddonRegistry,
      "registerSystemAddon",
      [
        "push-airdrop-factory",
        pushAirdropFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const pushAirdropFactoryAddress = m.readEventArgument(
      createPushAirdropFactoryAddon,
      "SystemAddonRegistered",
      "proxyAddress",
      { id: "pushAirdropFactoryAddress" }
    );
    const pushAirdropFactoryProxy = m.contractAt(
      "IATKPushAirdropFactory",
      pushAirdropFactoryAddress,
      {
        id: "pushAirdropFactory",
      }
    );

    return {
      pushAirdropFactory: pushAirdropFactoryProxy,
    };
  }
);

export default ATKOnboardingPushAirdropFactoryModule;
