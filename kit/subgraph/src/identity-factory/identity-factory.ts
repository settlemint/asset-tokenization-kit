import { Address, Bytes } from "@graphprotocol/graph-ts";
import {
  ContractIdentityCreated,
  IdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { ensureIdentityClassification } from "../identity/identity";
import { trackIdentityCreated } from "../stats/identity-stats";
import { fetchIdentityFactory } from "./fetch/identity-factory";

export function handleIdentityCreated(event: IdentityCreated): void {
  const identity = fetchIdentity(event.params.identity);
  let mutated = false;
  if (identity.deployedInTransaction.equals(Bytes.empty())) {
    identity.deployedInTransaction = event.transaction.hash;
    mutated = true;
  }
  const account = fetchAccount(event.params.wallet);
  if (!identity.account.equals(account.id)) {
    identity.account = account.id;
    mutated = true;
  }
  if (identity.isContract) {
    identity.isContract = false;
    mutated = true;
  }
  if (identity.identityFactory.toHexString() != event.address.toHexString()) {
    identity.identityFactory = event.address;
    mutated = true;
  }

  // Classify immediately so filters recognise freshly deployed contract identities.
  const classificationMutated = ensureIdentityClassification(identity);
  if (mutated || classificationMutated) {
    identity.save();
  }

  const identityFactory = fetchIdentityFactory(event.address);
  const system = identityFactory.system;

  // Track identity creation statistics
  trackIdentityCreated(event.params.wallet, Address.fromBytes(system), false);

  // Record the event that created the identity for the account
  // needs to be after creating the account as we map the involved accounts in the event
  fetchEvent(event, "IdentityCreated");
}

export function handleContractIdentityCreated(
  event: ContractIdentityCreated
): void {
  const identity = fetchIdentity(event.params.identity);
  let mutated = false;
  if (identity.deployedInTransaction.equals(Bytes.empty())) {
    identity.deployedInTransaction = event.transaction.hash;
    mutated = true;
  }
  const account = fetchAccount(event.params.contractAddress);
  if (!identity.account.equals(account.id)) {
    identity.account = account.id;
    mutated = true;
  }
  if (!identity.isContract) {
    identity.isContract = true;
    mutated = true;
  }
  if (identity.identityFactory.toHexString() != event.address.toHexString()) {
    identity.identityFactory = event.address;
    mutated = true;
  }

  // Classify immediately so filters recognise freshly deployed contract identities.
  const classificationMutated = ensureIdentityClassification(identity);
  if (mutated || classificationMutated) {
    identity.save();
  }

  const identityFactory = fetchIdentityFactory(event.address);
  const system = identityFactory.system;

  // Track identity creation statistics
  trackIdentityCreated(
    event.params.contractAddress,
    Address.fromBytes(system),
    true
  );

  // Record the event that created the identity for the account
  // needs to be after creating the account as we map the involved accounts in the event
  fetchEvent(event, "ContractIdentityCreated");
}
