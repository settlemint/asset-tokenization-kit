import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingStableCoinModule = buildModule(
  "ATKOnboardingStableCoinModule",
  (m) => {
    const { tokenFactoryRegistry } = m.useModule(ATKOnboardingSystemModule);
    const { stablecoinFactoryImplementation, stablecoinImplementation } =
      m.useModule(ATKModule);

    const createStableCoinFactory = m.call(
      tokenFactoryRegistry,
      "registerTokenFactory",
      ["stablecoin", stablecoinFactoryImplementation, stablecoinImplementation]
    );
    const stablecoinFactoryAddress = m.readEventArgument(
      createStableCoinFactory,
      "TokenFactoryCreated",
      "proxyAddress",
      { id: "stablecoinFactoryAddress" }
    );
    const stablecoinFactoryProxy = m.contractAt(
      "ATKStableCoinFactoryImplementation",
      stablecoinFactoryAddress,
      {
        id: "stablecoinFactory",
      }
    );

    return {
      stablecoinFactory: stablecoinFactoryProxy,
    };
  }
);

export default ATKOnboardingStableCoinModule;
