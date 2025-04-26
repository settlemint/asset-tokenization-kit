import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/Deposit/Deposit";
import {
  Deposit,
  Paused,
  RequirementChanged,
  Unpaused,
} from "../../generated/templates/Vault/Vault";
import { fetchAccount } from "../fetch/account";
import { EventName, Role } from "../utils/enums";
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

export function handleRequirementChanged(event: RequirementChanged): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.account);

  vault.requiredSigners = event.params.required;
  vault.lastActivity = event.block.timestamp;
  vault.save();

  createEvent(
    event,
    EventName.RequirementChanged,
    sender,
    [sender, vaultAccount],
    `{"account": "${event.params.account.toHex()}", "required": "${event.params.required.toString()}"}`
  );
}

export function handleRoleGranted(event: RoleGranted): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.sender);
  const account = fetchAccount(event.params.account);

  // Handle different roles
  if (event.params.role.toHexString() == Role.DEFAULT_ADMIN_ROLE) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < vault.admins.length; i++) {
      if (vault.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      vault.admins = vault.admins.concat([account.id]);

      createEvent(
        event,
        EventName.RoleGranted,
        sender,
        [sender, vaultAccount, account],
        `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "DEFAULT_ADMIN_ROLE"}`
      );
    }
  } else if (event.params.role.toHexString() == Role.SIGNER_ROLE) {
    // SIGNER_ROLE
    let found = false;
    for (let i = 0; i < vault.signers.length; i++) {
      if (vault.signers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      vault.signers = vault.signers.concat([account.id]);

      createEvent(
        event,
        EventName.RoleGranted,
        sender,
        [sender, vaultAccount, account],
        `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "SIGNER_ROLE"}`
      );
    }
  }

  vault.totalSigners = BigInt.fromI32(vault.signers.length);
  vault.lastActivity = event.block.timestamp;
  vault.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const vault = fetchVault(event.address, event.block.timestamp);
  const vaultAccount = fetchAccount(event.address);
  const sender = fetchAccount(event.params.sender);
  const account = fetchAccount(event.params.account);

  // Handle different roles
  if (event.params.role.toHexString() == Role.DEFAULT_ADMIN_ROLE) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < vault.admins.length; i++) {
      if (!vault.admins[i].equals(account.id)) {
        newAdmins.push(vault.admins[i]);
      }
    }
    vault.admins = newAdmins;

    createEvent(
      event,
      EventName.RoleRevoked,
      sender,
      [sender, vaultAccount, account],
      `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "DEFAULT_ADMIN_ROLE"}`
    );
  } else if (event.params.role.toHexString() == Role.SIGNER_ROLE) {
    // SIGNER_ROLE
    const newSigners: Bytes[] = [];
    for (let i = 0; i < vault.signers.length; i++) {
      if (!vault.signers[i].equals(account.id)) {
        newSigners.push(vault.signers[i]);
      }
    }
    vault.signers = newSigners;

    createEvent(
      event,
      EventName.RoleRevoked,
      sender,
      [sender, vaultAccount, account],
      `{"sender": "${event.params.sender.toHex()}", "account": "${event.params.account.toHex()}", "role": "SIGNER_ROLE"}`
    );
  }

  vault.totalSigners = BigInt.fromI32(vault.signers.length);
  vault.lastActivity = event.block.timestamp;
  vault.save();
}
