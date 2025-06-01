import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SMARTModule from "../../main";
import SMARTOnboardingSystemModule from "../system";

const SMARTOnboardingBondModule = buildModule(
  "SMARTOnboardingBondModule",
  (m) => {
    const { system } = m.useModule(SMARTOnboardingSystemModule);
    const { bondFactoryImplementation, bondImplementation } =
      m.useModule(SMARTModule);

    const createBondFactory = m.call(system, "createTokenFactory", [
      "bond",
      bondFactoryImplementation,
      bondImplementation,
    ]);
    const bondFactoryAddress = m.readEventArgument(
      createBondFactory,
      "TokenFactoryCreated",
      "proxyAddress",
      { id: "bondFactoryAddress" }
    );
    const bondFactoryProxy = m.contractAt(
      "SMARTBondFactoryImplementation",
      bondFactoryAddress,
      {
        id: "bondFactory",
      }
    );

    return {
      bondFactory: bondFactoryProxy,
    };
  }
);

export default SMARTOnboardingBondModule;
