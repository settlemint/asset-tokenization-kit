import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingDepositModule = buildModule(
  "ATKOnboardingDepositModule",
  (m) => {
    const { tokenFactoryRegistry } = m.useModule(ATKOnboardingSystemModule);
    const { depositFactoryImplementation, depositImplementation } =
      m.useModule(ATKModule);

    const createDepositFactory = m.call(
      tokenFactoryRegistry,
      "registerTokenFactory",
      ["deposit", depositFactoryImplementation, depositImplementation],
      {
        from: m.getAccount(0),
      }
    );
    const depositFactoryAddress = m.readEventArgument(
      createDepositFactory,
      "TokenFactoryRegistered",
      "proxyAddress",
      { id: "depositFactoryAddress" }
    );
    const depositFactoryProxy = m.contractAt(
      "ATKDepositFactoryImplementation",
      depositFactoryAddress,
      {
        id: "depositFactory",
      }
    );

    return {
      depositFactory: depositFactoryProxy,
    };
  }
);

export default ATKOnboardingDepositModule;
