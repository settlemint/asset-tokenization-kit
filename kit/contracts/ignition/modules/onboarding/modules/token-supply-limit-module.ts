import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const TokenSupplyLimitModule = buildModule("TokenSupplyLimitModule", (m) => {
  const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { tokenSupplyLimitModule } = m.useModule(ATKModule);

  m.call(complianceModuleRegistry, "registerComplianceModule", [
    tokenSupplyLimitModule,
  ]);

  return { tokenSupplyLimitModule };
});

export default TokenSupplyLimitModule;
