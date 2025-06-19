import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingXvPSettlementFactoryModule = buildModule(
  "ATKOnboardingXvPSettlementFactoryModule",
  (m) => {
    const { system, systemAddonRegistry } = m.useModule(
      ATKOnboardingSystemModule
    );
    const { xvpSettlementImplementation, xvpSettlementFactoryImplementation } =
      m.useModule(ATKModule);

    const platformAdmin = m.getAccount(0);

    // Create the factory addon (individual settlements are managed by factory, not system)
    const encodedInitializationData = m.encodeFunctionCall(
      xvpSettlementFactoryImplementation,
      "initialize",
      [system.address, platformAdmin]
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
