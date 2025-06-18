import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const IdentityBlockListModule = buildModule("IdentityBlockListModule", (m) => {
  const { system } = m.useModule(ATKOnboardingSystemModule);
  const { identityBlockListModule } = m.useModule(ATKModule);

  m.call(system, "registerComplianceModule", [identityBlockListModule]);

  return { identityBlockListModule };
});

export default IdentityBlockListModule;
