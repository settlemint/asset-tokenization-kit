import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SMARTModule from "../../main";
import SMARTOnboardingSystemModule from "../system";

const SMARTOnboardingFundModule = buildModule(
  "SMARTOnboardingFundModule",
  (m) => {
    const { system } = m.useModule(SMARTOnboardingSystemModule);
    const { fundFactoryImplementation, fundImplementation } =
      m.useModule(SMARTModule);

    const createFundFactory = m.call(system, "createTokenFactory", [
      "fund",
      fundFactoryImplementation,
      fundImplementation,
    ]);
    const fundFactoryAddress = m.readEventArgument(
      createFundFactory,
      "TokenFactoryCreated",
      "proxyAddress",
      { id: "fundFactoryAddress" },
    );
    const fundFactoryProxy = m.contractAt(
      "SMARTFundFactoryImplementation",
      fundFactoryAddress,
      {
        id: "fundFactory",
      },
    );

    return {
      fundFactory: fundFactoryProxy,
    };
  },
);

export default SMARTOnboardingFundModule;
