import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SMARTModule from "../../main";
import SMARTOnboardingSystemModule from "../system";

const SMARTOnboardingStableCoinModule = buildModule(
  "SMARTOnboardingStableCoinModule",
  (m) => {
    const { system } = m.useModule(SMARTOnboardingSystemModule);
    const { stablecoinFactoryImplementation, stablecoinImplementation } =
      m.useModule(SMARTModule);

    const createStableCoinFactory = m.call(system, "createTokenFactory", [
      "stablecoin",
      stablecoinFactoryImplementation,
      stablecoinImplementation,
    ]);
    const stablecoinFactoryAddress = m.readEventArgument(
      createStableCoinFactory,
      "TokenFactoryCreated",
      "proxyAddress",
      { id: "stablecoinFactoryAddress" },
    );
    const stablecoinFactoryProxy = m.contractAt(
      "SMARTStableCoinFactoryImplementation",
      stablecoinFactoryAddress,
      {
        id: "stablecoinFactory",
      },
    );

    return {
      stablecoinFactory: stablecoinFactoryProxy,
    };
  },
);

export default SMARTOnboardingStableCoinModule;
