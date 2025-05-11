import {
  CountryModified,
  IdentityModified,
  IdentityStored,
} from "../../generated/templates/IdentityRegistryStorage/IdentityRegistryStorage";
import { processEvent } from "../shared/event";

export function handleCountryModified(event: CountryModified): void {
  processEvent(event, "CountryModified");
}

export function handleIdentityModified(event: IdentityModified): void {
  processEvent(event, "IdentityModified");
}

export function handleIdentityStored(event: IdentityStored): void {
  processEvent(event, "IdentityStored");
}
