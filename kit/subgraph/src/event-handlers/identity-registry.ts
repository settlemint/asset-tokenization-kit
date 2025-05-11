import {
  CountryUpdated,
  IdentityRegistered,
  IdentityRemoved,
  IdentityUpdated,
} from "../../generated/templates/IdentityRegistry/IdentityRegistry";
import { processEvent } from "../shared/event";

export function handleCountryUpdated(event: CountryUpdated): void {
  processEvent(event, "CountryUpdated");
}

export function handleIdentityRegistered(event: IdentityRegistered): void {
  processEvent(event, "IdentityRegistered");
}

export function handleIdentityRemoved(event: IdentityRemoved): void {
  processEvent(event, "IdentityRemoved");
}

export function handleIdentityUpdated(event: IdentityUpdated): void {
  processEvent(event, "IdentityUpdated");
}
