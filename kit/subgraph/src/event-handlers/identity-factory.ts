import { Identity } from "../../generated/templates";
import {
  IdentityCreated,
  TokenIdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { processEvent } from "../shared/event";

export function handleIdentityCreated(event: IdentityCreated): void {
  processEvent(event, "IdentityCreated");
  Identity.create(event.params.identity);
}

export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {
  processEvent(event, "TokenIdentityCreated");
  Identity.create(event.params.identity);
}
