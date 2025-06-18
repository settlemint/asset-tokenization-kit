import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const IdentityAllowListModule = buildModule("IdentityAllowListModule", (m) => {
  const { system } = m.useModule(ATKOnboardingSystemModule);
  const { identityAllowListModule } = m.useModule(ATKModule);

  m.call(system, "registerComplianceModule", [identityAllowListModule]);

  return { identityAllowListModule };
});

export default IdentityAllowListModule;
