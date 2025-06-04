import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SMARTModule from "../main";

const SMARTOnboardingFixedYieldScheduleFactoryModule = buildModule(
  "SMARTOnboardingFixedYieldScheduleFactoryModule",
  (m) => {
    const { fixedYieldScheduleFactory } = m.useModule(SMARTModule);

    return {
      fixedYieldScheduleFactory,
    };
  }
);

export default SMARTOnboardingFixedYieldScheduleFactoryModule;
