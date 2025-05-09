import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Bond } from "../../generated/schema";
import {
  Approval,
  BondMatured,
  BondRedeemed,
  Clawback,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  Transfer,
  UnderlyingAssetTopUp,
  UnderlyingAssetWithdrawn,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from "../../generated/templates/Bond/Bond";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { setValueWithDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { calculateConcentration } from "./calculations/concentration";
import { updateFixedYield } from "./calculations/fixed-yield";
import { calculateTotalUnderlyingNeeded } from "./calculations/needed-underlying";
import { fetchBond } from "./fetch/bond";
import { fetchDeposit } from "./fetch/deposit";
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
  const bond = fetchBond(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = bond.decimals;

  if (from.equals(Address.zero())) {
    mintHandler(
      event,
      bond,
      bond.id,
      AssetType.bond,
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
      bond,
      bond.id,
      AssetType.bond,
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
      bond,
      bond.id,
      AssetType.bond,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  }
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function updateDerivedFieldsAndSave(
  bond: Bond,
  timestamp: BigInt
): void {
  updateFixedYield(bond);
  calculateTotalUnderlyingNeeded(bond);
  calculateConcentration(bond, bond.holders.load(), bond.totalSupplyExact);
  bond.lastActivity = timestamp;
  bond.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const bond = fetchBond(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleGrantedHandler(event, bond, role, roleHolder, sender);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const bond = fetchBond(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleRevokedHandler(event, bond, role, roleHolder, sender);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const bond = fetchBond(event.address);
  createActivityLogEntry(
    event,
    EventType.RoleAdminChanged,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const bond = fetchBond(event.address);
  const owner = event.params.owner;
  const spender = event.params.spender;
  approvalHandler(
    event,
    bond.id,
    event.params.value,
    bond.decimals,
    false,
    event.block.timestamp,
    owner,
    spender
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const bond = fetchBond(event.address);
  const sender = event.params.account;
  const holders = bond.holders.load();
  pauseHandler(
    event,
    bond,
    bond.id,
    AssetType.bond,
    bond.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleUnpaused(event: Unpaused): void {
  const bond = fetchBond(event.address);
  const sender = event.params.account;
  const holders = bond.holders.load();
  unPauseHandler(
    event,
    bond,
    bond.id,
    AssetType.bond,
    bond.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleClawback(event: Clawback): void {
  // This event is sent together with a transfer event, so we do not need to handle balances
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Clawback, event.params.sender, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
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

export function handleUserBlocked(event: UserBlocked): void {
  const bond = fetchBond(event.address);
  const user = event.params.user;
  blockUserHandler(
    event,
    bond.id,
    user,
    bond.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const bond = fetchBond(event.address);
  const user = event.params.user;
  unblockUserHandler(
    event,
    bond.id,
    user,
    bond.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleBondMatured(event: BondMatured): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Matured, event.params.sender, [
    event.params.sender,
  ]);
  bond.isMatured = true;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleBondRedeemed(event: BondRedeemed): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Redeemed, event.params.sender, [
    event.params.holder,
    event.params.sender,
  ]);
  const redeemedAmount = bond.redeemedAmountExact.plus(event.params.bondAmount);
  setValueWithDecimals(bond, "redeemedAmount", redeemedAmount, bond.decimals);
  const underlyingAmount = bond.underlyingBalanceExact.minus(
    event.params.underlyingAmount
  );
  setValueWithDecimals(
    bond,
    "underlyingBalanceExact",
    underlyingAmount,
    bond.underlyingAssetDecimals
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUp): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(
    event,
    EventType.UnderlyingAssetTopUp,
    event.params.from, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.from]
  );
  const underlyingBalanceExact = bond.underlyingBalanceExact.plus(
    event.params.amount
  );
  setValueWithDecimals(
    bond,
    "underlyingBalance",
    underlyingBalanceExact,
    bond.underlyingAssetDecimals
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawn
): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(
    event,
    EventType.UnderlyingAssetWithdrawn,
    event.params.to, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.to]
  );

  const underlyingBalanceExact = bond.underlyingBalanceExact.minus(
    event.params.amount
  );

  setValueWithDecimals(
    bond,
    "underlyingBalanceExact",
    underlyingBalanceExact,
    bond.underlyingAssetDecimals
  );

  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}
