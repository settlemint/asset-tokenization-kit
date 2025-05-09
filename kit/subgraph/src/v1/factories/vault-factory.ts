import { VaultCreated } from "../../../generated/VaultFactory/VaultFactory";
import { Vault } from "../../../generated/templates";
import { fetchVault } from "../custody/fetch/vault";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleVaultCreated(event: VaultCreated): void {
  fetchFactory(event.address, FactoryType.vault);
  const vault = fetchVault(event.params.vault, event.block.timestamp);
  vault.creator = fetchAccount(event.params.creator).id;

  createActivityLogEntry(event, EventType.VaultCreated, event.params.creator, [
    event.params.vault,
    event.params.creator,
  ]);

  Vault.create(event.params.vault);
}
