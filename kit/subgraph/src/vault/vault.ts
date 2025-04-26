import {
  Deposit,
  Paused,
  Unpaused,
} from "../../generated/templates/Vault/Vault";
import { fetchAccount } from "../fetch/account";
import { EventName } from "../utils/enums";
import { createEvent } from "../utils/events";
import { fetchVault } from "./fetch/vault";

export function handlePaused(event: Paused): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.account);

  vault.paused = true;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.Paused,
    sender,
    [sender, vaultAccount],
    `{"account": "${event.params.account.toHex()}"}`
  );
}

export function handleUnpaused(event: Unpaused): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.account);

  vault.paused = false;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.Unpaused,
    sender,
    [sender, vaultAccount],
    `{"account": "${event.params.account.toHex()}"}`
  );
}

export function handleDeposit(event: Deposit): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.sender);

  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.Deposit,
    sender,
    [sender, vaultAccount],
    `{"sender": "${event.params.sender.toHex()}", "value": "${event.params.value.toString()}", "balance": "${event.params.balance.toString()}"}`
  );
}
