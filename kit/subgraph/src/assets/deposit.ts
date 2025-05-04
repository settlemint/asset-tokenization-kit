import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Deposit } from "../../generated/schema";
import {
  Approval,
  Clawback,
  CollateralUpdated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  TokenWithdrawn,
  Transfer,
  Unpaused,
  UserAllowed,
  UserDisallowed,
} from "../../generated/templates/Deposit/Deposit";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { AssetType } from "../utils/enums";
import { calculateCollateral } from "./calculations/collateral";
import { calculateConcentration } from "./calculations/concentration";
import { fetchDeposit } from "./fetch/deposit";
import { allowUserHandler, disallowUserHandler } from "./handlers/allowlist";
import { approvalHandler } from "./handlers/approval";
import { burnHandler } from "./handlers/burn";
import { collateralUpdatedHandler } from "./handlers/collateral";
import { frozenHandler } from "./handlers/frozen";
import { mintHandler } from "./handlers/mint";
import { pauseHandler } from "./handlers/pause";
import { roleGrantedHandler } from "./handlers/role-granted";
import { roleRevokedHandler } from "./handlers/role-revoked";
import { transferHandler } from "./handlers/transfer";
import { unPauseHandler } from "./handlers/unpause";

export function handleTransfer(event: Transfer): void {
  const deposit = fetchDeposit(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = deposit.decimals;

  if (from.equals(Address.zero())) {
    mintHandler(
      event,
      deposit,
      deposit.id,
      AssetType.deposit,
      event.block.timestamp,
      to,
      value,
      decimals,
      true,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  } else if (to.equals(Address.zero())) {
    burnHandler(
      event,
      deposit,
      deposit.id,
      AssetType.deposit,
      event.block.timestamp,
      event.params.from,
      event.params.value,
      decimals,
      true,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  } else {
    transferHandler(
      event,
      deposit,
      deposit.id,
      AssetType.deposit,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  }
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function updateDerivedFieldsAndSave(
  deposit: Deposit,
  timestamp: BigInt
): void {
  calculateCollateral(
    deposit,
    deposit.id,
    deposit.collateralExact,
    deposit.totalSupplyExact,
    deposit.decimals
  );
  calculateConcentration(
    deposit,
    deposit.holders.load(),
    deposit.totalSupplyExact
  );

  deposit.lastActivity = timestamp;
  deposit.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const deposit = fetchDeposit(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleGrantedHandler(event, deposit, role, roleHolder, sender);
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const deposit = fetchDeposit(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleRevokedHandler(event, deposit, role, roleHolder, sender);
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const deposit = fetchDeposit(event.address);
  createActivityLogEntry(
    event,
    EventType.RoleAdminChanged,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const deposit = fetchDeposit(event.address);
  const owner = event.params.owner;
  const spender = event.params.spender;
  approvalHandler(
    event,
    deposit.id,
    event.params.value,
    deposit.decimals,
    false,
    event.block.timestamp,
    owner,
    spender
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const deposit = fetchDeposit(event.address);
  const sender = event.params.account;
  const holders = deposit.holders.load();
  pauseHandler(
    event,
    deposit,
    deposit.id,
    AssetType.deposit,
    deposit.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleUnpaused(event: Unpaused): void {
  const deposit = fetchDeposit(event.address);
  const sender = event.params.account;
  const holders = deposit.holders.load();
  unPauseHandler(
    event,
    deposit,
    deposit.id,
    AssetType.deposit,
    deposit.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleClawback(event: Clawback): void {
  // This event is sent together with a transfer event, so we do not need to handle balances
  const deposit = fetchDeposit(event.address);
  createActivityLogEntry(event, EventType.Clawback, event.params.sender, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const deposit = fetchDeposit(event.address);
  const user = event.params.user;
  const amount = event.params.amount;
  frozenHandler(
    event,
    deposit.id,
    AssetType.deposit,
    user,
    amount,
    deposit.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
}

export function handleUserAllowed(event: UserAllowed): void {
  const deposit = fetchDeposit(event.address);
  allowUserHandler(
    event,
    deposit.id,
    event.params.user,
    deposit.decimals,
    true,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleUserDisallowed(event: UserDisallowed): void {
  const deposit = fetchDeposit(event.address);
  disallowUserHandler(
    event,
    deposit.id,
    event.params.user,
    deposit.decimals,
    true,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const deposit = fetchDeposit(event.address);
  createActivityLogEntry(
    event,
    EventType.TokenWithdrawn,
    event.params.to, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.token, event.params.to]
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleCollateralUpdated(event: CollateralUpdated): void {
  const deposit = fetchDeposit(event.address);
  collateralUpdatedHandler(
    event,
    deposit,
    event.params.newAmount,
    deposit.decimals,
    event.block.timestamp,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}
