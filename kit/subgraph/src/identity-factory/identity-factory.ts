import { Address } from "@graphprotocol/graph-ts";
import {
  ContractIdentityCreated,
  IdentityCreated,
} from "../../generated/templates/IdentityFactory/IdentityFactory";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { updateIdentityEntityType } from "../identity/utils/identity-classification";
import { trackIdentityCreated } from "../stats/identity-stats";
import { fetchIdentityFactory } from "./fetch/identity-factory";

export function handleIdentityCreated(event: IdentityCreated): void {
  const identity = fetchIdentity(event.params.identity);
  identity.deployedInTransaction = event.transaction.hash;
  const account = fetchAccount(event.params.wallet);
  identity.account = account.id;
  identity.isContract = false;
  identity.identityFactory = event.address;

  // Re-evaluate entityType so filters recognise freshly deployed identities.
  updateIdentityEntityType(identity);
  identity.save();

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
  identity.deployedInTransaction = event.transaction.hash;
  const account = fetchAccount(event.params.contractAddress);
  identity.account = account.id;
  identity.isContract = true;
  identity.identityFactory = event.address;

  // Re-evaluate entityType so filters recognise freshly deployed identities.
  updateIdentityEntityType(identity);
  identity.save();

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
