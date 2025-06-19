import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const AddressBlockListModule = buildModule("AddressBlockListModule", (m) => {
  const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { addressBlockListModule } = m.useModule(ATKModule);

  m.call(complianceModuleRegistry, "registerComplianceModule", [
    addressBlockListModule,
  ]);

  return { addressBlockListModule };
});

export default AddressBlockListModule;
