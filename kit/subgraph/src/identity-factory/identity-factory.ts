import { Bytes } from "@graphprotocol/graph-ts";
import {
  ContractIdentityCreated,
  IdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";

export function handleIdentityCreated(event: IdentityCreated): void {
  const identity = fetchIdentity(event.params.identity);
  if (identity.deployedInTransaction.equals(Bytes.empty())) {
    identity.deployedInTransaction = event.transaction.hash;
  }
  const account = fetchAccount(event.params.wallet);
  identity.account = account.id;
  identity.isContract = false;
  identity.identityFactory = event.address;
  identity.save();
  // Record the event that created the identity for the account
  // needs to be after creating the account as we map the involved accounts in the event
  fetchEvent(event, "IdentityCreated");
}

export function handleContractIdentityCreated(
  event: ContractIdentityCreated
): void {
  const identity = fetchIdentity(event.params.identity);
  if (identity.deployedInTransaction.equals(Bytes.empty())) {
    identity.deployedInTransaction = event.transaction.hash;
  }
  const account = fetchAccount(event.params.contractAddress);
  identity.account = account.id;
  identity.isContract = true;
  identity.identityFactory = event.address;
  identity.save();

  // Record the event that created the identity for the account
  // needs to be after creating the account as we map the involved accounts in the event
  fetchEvent(event, "ContractIdentityCreated");
}
