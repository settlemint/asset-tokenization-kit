import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingFundModule = buildModule("ATKOnboardingFundModule", (m) => {
  const { system } = m.useModule(ATKOnboardingSystemModule);
  const { fundFactoryImplementation, fundImplementation } =
    m.useModule(ATKModule);

  const createFundFactory = m.call(system, "createTokenFactory", [
    "fund",
    fundFactoryImplementation,
    fundImplementation,
  ]);
  const fundFactoryAddress = m.readEventArgument(
    createFundFactory,
    "TokenFactoryCreated",
    "proxyAddress",
    { id: "fundFactoryAddress" }
  );
  const fundFactoryProxy = m.contractAt(
    "ATKFundFactoryImplementation",
    fundFactoryAddress,
    {
      id: "fundFactory",
    }
  );

  return {
    fundFactory: fundFactoryProxy,
  };
});

export default ATKOnboardingFundModule;
