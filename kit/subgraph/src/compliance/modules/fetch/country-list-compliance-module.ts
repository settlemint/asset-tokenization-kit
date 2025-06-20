import { Address } from "@graphprotocol/graph-ts";
import { CountryListComplianceModule } from "../../../../generated/schema";
import { AbstractCountryComplianceModule as CountryListComplianceModuleTemplate } from "../../../../generated/templates";

export function fetchCountryListComplianceModule(
  address: Address
): CountryListComplianceModule {
  let countryListComplianceModule = CountryListComplianceModule.load(address);

  if (!countryListComplianceModule) {
    countryListComplianceModule = new CountryListComplianceModule(address);
    countryListComplianceModule.countries = [];
    countryListComplianceModule.save();
    CountryListComplianceModuleTemplate.create(address);
  }

  return countryListComplianceModule;
}
