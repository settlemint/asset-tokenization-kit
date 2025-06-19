import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingEquityModule = buildModule(
  "ATKOnboardingEquityModule",
  (m) => {
    const { tokenFactoryRegistry } = m.useModule(ATKOnboardingSystemModule);
    const { equityFactoryImplementation, equityImplementation } =
      m.useModule(ATKModule);

    const createEquityFactory = m.call(
      tokenFactoryRegistry,
      "registerTokenFactory",
      ["equity", equityFactoryImplementation, equityImplementation]
    );
    const equityFactoryAddress = m.readEventArgument(
      createEquityFactory,
      "TokenFactoryCreated",
      "proxyAddress",
      { id: "equityFactoryAddress" }
    );
    const equityFactoryProxy = m.contractAt(
      "ATKEquityFactoryImplementation",
      equityFactoryAddress,
      {
        id: "equityFactory",
      }
    );

    return {
      equityFactory: equityFactoryProxy,
    };
  }
);

export default ATKOnboardingEquityModule;
