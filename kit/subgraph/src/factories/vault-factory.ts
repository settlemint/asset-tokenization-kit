import { VaultCreated } from "../../generated/VaultFactory/VaultFactory";
import { Vault } from "../../generated/templates";
import { fetchAccount } from "../fetch/account";
import { EventName, FactoryType } from "../utils/enums";
import { createEvent } from "../utils/events";
import { fetchVault } from "../vault/fetch/vault";
import { fetchFactory } from "./fetch/factory";

export function handleVaultCreated(event: VaultCreated): void {
  fetchFactory(event.address, FactoryType.vault);
  const creator = fetchAccount(event.params.creator);
  fetchVault(event.params.vault, event.block.timestamp);
  const vaultAccount = fetchAccount(event.params.vault);

  createEvent(
    event,
    EventName.VaultCreated,
    creator,
    [creator, vaultAccount],
    `{"creator": "${event.params.creator.toHex()}", "vault": "${event.params.vault.toHex()}"}`
  );

  Vault.create(event.params.vault);
}
