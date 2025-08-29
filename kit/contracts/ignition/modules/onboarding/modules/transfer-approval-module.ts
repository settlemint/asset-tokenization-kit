import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const TransferApprovalModule = buildModule("TransferApprovalModule", (m) => {
  const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { transferApprovalModule } = m.useModule(ATKModule);

  m.call(complianceModuleRegistry, "registerComplianceModule", [
    transferApprovalModule,
  ]);

  return { transferApprovalModule };
});

export default TransferApprovalModule;
