import { GlobalCountryListChange as GlobalCountryListChangeEvent } from "../../../generated/templates/AbstractCountryComplianceModule/AbstractCountryComplianceModule";
import { fetchEvent } from "../../event/fetch/event";
import { fetchCountryListComplianceModule } from "./fetch/country-list-compliance-module";

export function handleGlobalCountryListChange(
  event: GlobalCountryListChangeEvent
): void {
  fetchEvent(event, "GlobalCountryListChange");

  const countryListComplianceModule = fetchCountryListComplianceModule(
    event.address
  );
  if (event.params.inList) {
    countryListComplianceModule.countries.push(event.params.country);
  } else {
    const newCountries: i32[] = [];
    const currentCountries = countryListComplianceModule.countries;
    for (let i = 0; i < currentCountries.length; i++) {
      if (currentCountries[i] != event.params.country) {
        newCountries.push(currentCountries[i]);
      }
    }
    countryListComplianceModule.countries = newCountries;
  }
  countryListComplianceModule.save();
}
