import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Vault as VaultTemplate } from "../../../../generated/templates";
import { ATKVaultCreated } from "../../../../generated/templates/VaultFactory/VaultFactory";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchIdentity } from "../../../identity/fetch/identity";
import { fetchVault } from "./fetch/vault";
import { fetchVaultFactory } from "./fetch/vault-factory";

export function handleATKVaultCreated(event: ATKVaultCreated): void {
  fetchEvent(event, "ATKVaultCreated");

  const vaultFactory = fetchVaultFactory(event.address);
  const vault = fetchVault(event.params.vault);

  // Set vault properties
  vault.factory = vaultFactory.id;
  vault.createdAt = event.block.timestamp;
  vault.createdBy = event.params.creator;
  vault.deployedInTransaction = event.transaction.hash;

  // Initialize balance tracking
  vault.balance = BigDecimal.fromString("0");
  vault.balanceExact = BigInt.fromI32(0);

  vault.save();

  const identity = fetchIdentity(event.params.contractIdentity);
  identity.isContract = true;
  identity.save();

  // Create the vault template to start tracking vault events
  VaultTemplate.create(event.params.vault);
}
