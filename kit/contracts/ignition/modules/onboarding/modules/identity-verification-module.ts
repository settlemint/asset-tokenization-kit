import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const IdentityVerificationModule = buildModule(
  "IdentityVerificationModule",
  (m) => {
    const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
    const { identityVerificationModule } = m.useModule(ATKModule);

    m.call(complianceModuleRegistry, "registerComplianceModule", [
      identityVerificationModule,
    ]);

    return { identityVerificationModule };
  }
);

export default IdentityVerificationModule;
