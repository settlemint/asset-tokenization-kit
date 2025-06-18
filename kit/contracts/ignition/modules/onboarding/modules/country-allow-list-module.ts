import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const CountryAllowListModule = buildModule("CountryAllowListModule", (m) => {
  const { system } = m.useModule(ATKOnboardingSystemModule);
  const { countryAllowListModule } = m.useModule(ATKModule);

  m.call(system, "registerComplianceModule", [countryAllowListModule]);

  return { countryAllowListModule };
});

export default CountryAllowListModule;
