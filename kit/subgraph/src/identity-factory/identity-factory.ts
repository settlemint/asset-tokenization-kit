import { Bytes } from "@graphprotocol/graph-ts";
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
  if (identity.deployedInTransaction.equals(Bytes.empty())) {
    identity.deployedInTransaction = event.transaction.hash;
  }
  const account = fetchAccount(event.params.wallet);
  account.identity = identity.id;
  account.save();
  identity.account = account.id;
  identity.save();
  // Record the event that created the identity for the account
  // needs to be after creating the account as we map the involved accounts in the event
  fetchEvent(event, "IdentityCreated");
}

export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {
  const identity = fetchIdentity(event.params.identity);
  if (identity.deployedInTransaction.equals(Bytes.empty())) {
    identity.deployedInTransaction = event.transaction.hash;
  }
  const token = fetchToken(event.params.token);
  token.identity = identity.id;
  token.save();
  identity.token = token.id;
  identity.save();
  // Record the event that created the identity for the account
  // needs to be after creating the account as we map the involved accounts in the event
  fetchEvent(event, "TokenIdentityCreated");
}
