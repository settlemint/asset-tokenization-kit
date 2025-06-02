import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SMARTModule from "../../main";
import SMARTOnboardingSystemModule from "../system";

const SMARTOnboardingEquityModule = buildModule(
  "SMARTOnboardingEquityModule",
  (m) => {
    const { system } = m.useModule(SMARTOnboardingSystemModule);
    const { equityFactoryImplementation, equityImplementation } =
      m.useModule(SMARTModule);

    const createEquityFactory = m.call(system, "createTokenFactory", [
      "equity",
      equityFactoryImplementation,
      equityImplementation,
    ]);
    const equityFactoryAddress = m.readEventArgument(
      createEquityFactory,
      "TokenFactoryCreated",
      "proxyAddress",
      { id: "equityFactoryAddress" }
    );
    const equityFactoryProxy = m.contractAt(
      "SMARTEquityFactoryImplementation",
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

export default SMARTOnboardingEquityModule;
