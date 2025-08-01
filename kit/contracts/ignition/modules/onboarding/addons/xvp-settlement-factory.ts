import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingXvPSettlementFactoryModule = buildModule(
  "ATKOnboardingXvPSettlementFactoryModule",
  (m) => {
    const { system, systemAddonRegistry, systemAccessManager } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { xvpSettlementFactoryImplementation } = m.useModule(ATKModule);

    // Create the factory addon (individual settlements are managed by factory, not system)
    const encodedInitializationData = m.encodeFunctionCall(
      xvpSettlementFactoryImplementation,
      "initialize",
      [systemAccessManager.address, system.address]
    );

    const createXvPSettlementFactoryAddon = m.call(
      systemAddonRegistry,
      "registerSystemAddon",
      [
        "xvp-settlement-factory",
        xvpSettlementFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const xvpSettlementFactoryAddress = m.readEventArgument(
      createXvPSettlementFactoryAddon,
      "SystemAddonRegistered",
      "proxyAddress",
      { id: "xvpSettlementFactoryAddress" }
    );
    const xvpSettlementFactoryProxy = m.contractAt(
      "IATKXvPSettlementFactory",
      xvpSettlementFactoryAddress,
      {
        id: "xvpSettlementFactory",
      }
    );

    return {
      xvpSettlementFactory: xvpSettlementFactoryProxy,
    };
  }
);

export default ATKOnboardingXvPSettlementFactoryModule;
