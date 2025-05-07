import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Equity } from "../../generated/schema";
import {
  Approval,
  Clawback,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  Transfer,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from "../../generated/templates/Equity/Equity";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { AssetType } from "../utils/enums";
import { calculateConcentration } from "./calculations/concentration";
import { fetchEquity } from "./fetch/equity";
import { approvalHandler } from "./handlers/approval";
import { blockUserHandler, unblockUserHandler } from "./handlers/blocklist";
import { burnHandler } from "./handlers/burn";
import { frozenHandler } from "./handlers/frozen";
import { mintHandler } from "./handlers/mint";
import { pauseHandler } from "./handlers/pause";
import { roleGrantedHandler } from "./handlers/role-granted";
import { roleRevokedHandler } from "./handlers/role-revoked";
import { transferHandler } from "./handlers/transfer";
import { unPauseHandler } from "./handlers/unpause";

export function handleTransfer(event: Transfer): void {
  const equity = fetchEquity(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = equity.decimals;

  if (from.equals(Address.zero())) {
    mintHandler(
      event,
      equity,
      equity.id,
      AssetType.equity,
      event.block.timestamp,
      to,
      value,
      decimals,
      false,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  } else if (to.equals(Address.zero())) {
    burnHandler(
      event,
      equity,
      equity.id,
      AssetType.equity,
      event.block.timestamp,
      event.params.from,
      event.params.value,
      decimals,
      false,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  } else {
    transferHandler(
      event,
      equity,
      equity.id,
      AssetType.equity,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  }
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function updateDerivedFieldsAndSave(
  equity: Equity,
  timestamp: BigInt
): void {
  calculateConcentration(
    equity,
    equity.holders.load(),
    equity.totalSupplyExact
  );

  equity.lastActivity = timestamp;
  equity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const equity = fetchEquity(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleGrantedHandler(event, equity, role, roleHolder, sender);
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const equity = fetchEquity(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleRevokedHandler(event, equity, role, roleHolder, sender);
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const equity = fetchEquity(event.address);
  createActivityLogEntry(
    event,
    EventType.RoleAdminChanged,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const equity = fetchEquity(event.address);
  const owner = event.params.owner;
  const spender = event.params.spender;
  approvalHandler(
    event,
    equity.id,
    event.params.value,
    equity.decimals,
    false,
    event.block.timestamp,
    owner,
    spender
  );
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const equity = fetchEquity(event.address);
  const sender = event.params.account;
  const holders = equity.holders.load();
  pauseHandler(
    event,
    equity,
    equity.id,
    AssetType.equity,
    equity.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleUnpaused(event: Unpaused): void {
  const equity = fetchEquity(event.address);
  const sender = event.params.account;
  const holders = equity.holders.load();
  unPauseHandler(
    event,
    equity,
    equity.id,
    AssetType.equity,
    equity.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleClawback(event: Clawback): void {
  // This event is sent together with a transfer event, so we do not need to handle balances
  const equity = fetchEquity(event.address);
  createActivityLogEntry(event, EventType.Clawback, event.params.sender, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const equity = fetchEquity(event.address);
  const user = event.params.user;
  const amount = event.params.amount;
  frozenHandler(
    event,
    equity.id,
    AssetType.equity,
    user,
    amount,
    equity.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const equity = fetchEquity(event.address);
  const user = event.params.user;
  blockUserHandler(
    event,
    equity.id,
    user,
    equity.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const equity = fetchEquity(event.address);
  const user = event.params.user;
  unblockUserHandler(
    event,
    equity.id,
    user,
    equity.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(equity, event.block.timestamp);
}
