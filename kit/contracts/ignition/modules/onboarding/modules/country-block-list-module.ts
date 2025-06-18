import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const CountryBlockListModule = buildModule("CountryBlockListModule", (m) => {
  const { system } = m.useModule(ATKOnboardingSystemModule);
  const { countryBlockListModule } = m.useModule(ATKModule);

  m.call(system, "registerComplianceModule", [countryBlockListModule]);

  return { countryBlockListModule };
});

export default CountryBlockListModule;
