import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingStableCoinModule = buildModule(
  "ATKOnboardingStableCoinModule",
  (m) => {
    const { tokenFactoryRegistry } = m.useModule(ATKOnboardingSystemModule);
    const { stablecoinFactoryImplementation, stablecoinImplementation } =
      m.useModule(ATKModule);

    const createStablecoinFactory = m.call(
      tokenFactoryRegistry,
      "registerTokenFactory",
      ["stablecoin", stablecoinFactoryImplementation, stablecoinImplementation],
      {
        from: m.getAccount(0),
      }
    );
    const stablecoinFactoryAddress = m.readEventArgument(
      createStablecoinFactory,
      "TokenFactoryRegistered",
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
