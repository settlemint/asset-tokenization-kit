import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Fund } from "../../generated/schema";
import {
  Approval,
  Clawback,
  ManagementFeeCollected,
  Paused,
  PerformanceFeeCollected,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  TokenWithdrawn,
  Transfer,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from "../../generated/templates/Fund/Fund";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { AssetType } from "../utils/enums";
import { calculateConcentration } from "./calculations/concentration";
import { fetchFund } from "./fetch/fund";
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
  const fund = fetchFund(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = fund.decimals;

  if (from.equals(Address.zero())) {
    mintHandler(
      event,
      fund,
      fund.id,
      AssetType.fund,
      event.block.timestamp,
      to,
      value,
      decimals,
      false
    );
  } else if (to.equals(Address.zero())) {
    burnHandler(
      event,
      fund,
      fund.id,
      AssetType.fund,
      event.block.timestamp,
      event.params.from,
      event.params.value,
      decimals,
      false
    );
  } else {
    transferHandler(
      event,
      fund,
      fund.id,
      AssetType.fund,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false
    );
  }
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function updateDerivedFieldsAndSave(
  fund: Fund,
  timestamp: BigInt
): void {
  calculateConcentration(fund, fund.holders.load(), fund.totalSupplyExact);

  fund.lastActivity = timestamp;
  fund.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const fund = fetchFund(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleGrantedHandler(event, fund, role, roleHolder, sender);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const fund = fetchFund(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleRevokedHandler(event, fund, role, roleHolder, sender);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const fund = fetchFund(event.address);
  createActivityLogEntry(event, EventType.RoleAdminChanged, []);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const fund = fetchFund(event.address);
  const owner = event.params.owner;
  const spender = event.params.spender;
  approvalHandler(
    event,
    fund.id,
    event.params.value,
    fund.decimals,
    false,
    event.block.timestamp,
    owner,
    spender
  );
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const fund = fetchFund(event.address);
  const sender = event.params.account;
  const holders = fund.holders.load();
  pauseHandler(
    event,
    fund,
    fund.id,
    AssetType.fund,
    fund.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleUnpaused(event: Unpaused): void {
  const fund = fetchFund(event.address);
  const sender = event.params.account;
  const holders = fund.holders.load();
  unPauseHandler(
    event,
    fund,
    fund.id,
    AssetType.fund,
    fund.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleClawback(event: Clawback): void {
  // This event is sent together with a transfer event, so we do not need to handle balances
  const fund = fetchFund(event.address);
  createActivityLogEntry(event, EventType.Clawback, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const fund = fetchFund(event.address);
  const user = event.params.user;
  const amount = event.params.amount;
  frozenHandler(
    event,
    fund.id,
    AssetType.fund,
    user,
    amount,
    fund.decimals,
    false
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const fund = fetchFund(event.address);
  const user = event.params.user;
  blockUserHandler(event, fund.id, user, fund.decimals, false);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const fund = fetchFund(event.address);
  const user = event.params.user;
  unblockUserHandler(event, fund.id, user, fund.decimals, false);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleManagementFeeCollected(
  event: ManagementFeeCollected
): void {
  const fund = fetchFund(event.address);
  createActivityLogEntry(event, EventType.ManagementFeeCollected, []);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handlePerformanceFeeCollected(
  event: PerformanceFeeCollected
): void {
  const fund = fetchFund(event.address);
  createActivityLogEntry(event, EventType.PerformanceFeeCollected, []);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const fund = fetchFund(event.address);
  createActivityLogEntry(event, EventType.TokenWithdrawn, [
    event.params.token,
    event.params.to,
  ]);
  updateDerivedFieldsAndSave(fund, event.block.timestamp);
}
