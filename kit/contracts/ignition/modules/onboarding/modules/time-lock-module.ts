import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const TimeLockModule = buildModule("TimeLockModule", (m) => {
  const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { timeLockModule } = m.useModule(ATKModule);

  m.call(complianceModuleRegistry, "registerComplianceModule", [
    timeLockModule,
  ]);

  return { timeLockModule };
});

export default TimeLockModule;
