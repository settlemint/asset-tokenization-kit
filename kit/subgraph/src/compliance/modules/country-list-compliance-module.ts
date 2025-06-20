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
    countryListComplianceModule.countries =
      countryListComplianceModule.countries.filter(
        (country) => country != event.params.country
      );
  }
  countryListComplianceModule.save();
}
