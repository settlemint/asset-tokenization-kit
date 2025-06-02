import {
  IdentityCreated,
  TokenIdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchToken } from "../token/fetch/token";

export function handleIdentityCreated(event: IdentityCreated): void {
  const identity = fetchIdentity(event.params.identity);
  const account = fetchAccount(event.params.wallet);
  account.identity = identity.id;
  account.save();
  // Put at the end as IdentityCreated event is needed to be processed first as the account needs to be set on the identity
  fetchEvent(event, "IdentityCreated");
}

export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {
  fetchEvent(event, "TokenIdentityCreated");
  const identity = fetchIdentity(event.params.identity);
  const token = fetchToken(event.params.token);
  token.identity = identity.id;
  token.save();
}
