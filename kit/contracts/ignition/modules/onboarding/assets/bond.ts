import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const ATKOnboardingBondModule = buildModule("ATKOnboardingBondModule", (m) => {
  const { tokenFactoryRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { bondFactoryImplementation, bondImplementation } =
    m.useModule(ATKModule);

  const createBondFactory = m.call(
    tokenFactoryRegistry,
    "registerTokenFactory",
    ["bond", bondFactoryImplementation, bondImplementation],
    {
      from: m.getAccount(0),
    }
  );
  const bondFactoryAddress = m.readEventArgument(
    createBondFactory,
    "TokenFactoryRegistered",
    "proxyAddress",
    { id: "bondFactoryAddress" }
  );
  const bondFactoryProxy = m.contractAt(
    "ATKBondFactoryImplementation",
    bondFactoryAddress,
    {
      id: "bondFactory",
    }
  );

  return {
    bondFactory: bondFactoryProxy,
  };
});

export default ATKOnboardingBondModule;
