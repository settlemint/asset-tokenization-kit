import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const InvestorCountModule = buildModule("InvestorCountModule", (m) => {
  const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { investorCountModule } = m.useModule(ATKModule);

  m.call(complianceModuleRegistry, "registerComplianceModule", [
    investorCountModule,
  ]);

  return { investorCountModule };
});

export default InvestorCountModule;
