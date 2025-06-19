import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ATKModule from "../../main";
import ATKOnboardingSystemModule from "../system";

const CountryAllowListModule = buildModule("CountryAllowListModule", (m) => {
  const { complianceModuleRegistry } = m.useModule(ATKOnboardingSystemModule);
  const { countryAllowListModule } = m.useModule(ATKModule);

  m.call(complianceModuleRegistry, "registerComplianceModule", [
    countryAllowListModule,
  ]);

  return { countryAllowListModule };
});

export default CountryAllowListModule;
