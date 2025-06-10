import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingDepositModule = buildModule(
  "ATKOnboardingDepositModule",
  (m) => {
    const { system } = m.useModule(ATKOnboardingSystemModule);
    const { depositFactoryImplementation, depositImplementation } =
      m.useModule(ATKModule);

    const createDepositFactory = m.call(system, "createTokenFactory", [
      "deposit",
      depositFactoryImplementation,
      depositImplementation,
    ]);
    const depositFactoryAddress = m.readEventArgument(
      createDepositFactory,
      "TokenFactoryCreated",
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
