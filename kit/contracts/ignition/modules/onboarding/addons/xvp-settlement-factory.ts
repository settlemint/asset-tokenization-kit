import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingXvPSettlementFactoryModule = buildModule(
  "ATKOnboardingXvPSettlementFactoryModule",
  (m) => {
    const { system } = m.useModule(ATKOnboardingSystemModule);
    const { xvpSettlementFactoryImplementation } = m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    const encodedInitializationData = m.encodeFunctionCall(
      xvpSettlementFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
    );

    const createXvPSettlementFactoryAddon = m.call(
      system,
      "createSystemAddon",
      [
        "xvp-settlement-factory",
        xvpSettlementFactoryImplementation,
        encodedInitializationData,
      ]
    );
    const xvpSettlementFactoryAddress = m.readEventArgument(
      createXvPSettlementFactoryAddon,
      "SystemAddonCreated",
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
