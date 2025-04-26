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

  const involved = [creator, vaultAccount];
  let signersString = "";
  for (let i = 0; i < event.params.signers.length; i++) {
    const signer = fetchAccount(event.params.signers[i]);
    involved.push(signer);

    signersString += event.params.signers[i].toHex();
    if (i < event.params.signers.length - 1) {
      signersString += ",";
    }
  }

  createEvent(
    event,
    EventName.VaultCreated,
    creator,
    involved,
    `{"creator": "${event.params.creator.toHex()}", "vault": "${event.params.vault.toHex()}", "signers": "${signersString}", "required": "${event.params.required.toString()}"}`
  );

  Vault.create(event.params.vault);
}
