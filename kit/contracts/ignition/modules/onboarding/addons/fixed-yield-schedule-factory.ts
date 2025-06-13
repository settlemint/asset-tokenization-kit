import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingFixedYieldScheduleFactoryModule = buildModule(
  "ATKOnboardingFixedYieldScheduleFactoryModule",
  (m) => {
    const { system } = m.useModule(ATKOnboardingSystemModule);
    const { fixedYieldScheduleFactoryImplementation } = m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    const encodedInitializationData = m.encodeFunctionCall(
      fixedYieldScheduleFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
    );

    const createFixedYieldScheduleFactoryAddon = m.call(
      system,
      "createSystemAddon",
      [
        "fixed-yield-schedule-factory",
        fixedYieldScheduleFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const fixedYieldScheduleFactoryAddress = m.readEventArgument(
      createFixedYieldScheduleFactoryAddon,
      "SystemAddonCreated",
      "proxyAddress",
      { id: "fixedYieldScheduleFactoryAddress" }
    );
    const fixedYieldScheduleFactoryProxy = m.contractAt(
      "IATKFixedYieldScheduleFactory",
      fixedYieldScheduleFactoryAddress,
      {
        id: "fixedYieldScheduleFactory",
      }
    );

    return {
      fixedYieldScheduleFactory: fixedYieldScheduleFactoryProxy,
    };
  }
);

export default ATKOnboardingFixedYieldScheduleFactoryModule;
