import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const AddressBlockListModule = buildModule("AddressBlockListModule", (m) => {
  const { system } = m.useModule(ATKOnboardingSystemModule);
  const { addressBlockListModule } = m.useModule(ATKModule);

  m.call(system, "registerComplianceModule", [addressBlockListModule]);

  return { addressBlockListModule };
});

export default AddressBlockListModule;
