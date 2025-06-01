import {
  IdentityCreated,
  TokenIdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchToken } from "../token/fetch/token";

export function handleIdentityCreated(event: IdentityCreated): void {
  fetchEvent(event, "IdentityCreated");
  const identity = fetchIdentity(event.params.identity);
  const account = fetchAccount(event.params.wallet);
  account.identity = identity.id;
  account.save();
}

export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {
  fetchEvent(event, "TokenIdentityCreated");
  const identity = fetchIdentity(event.params.identity);
  const token = fetchToken(event.params.token);
  token.identity = identity.id;
  token.save();
}
