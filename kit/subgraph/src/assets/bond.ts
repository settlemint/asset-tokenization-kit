import { Address, BigInt, log } from "@graphprotocol/graph-ts";
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
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { fetchAssetBalance } from "../fetch/balance";
import { blockUser, unblockUser } from "../fetch/block-user";
import { increase } from "../utils/counters";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { eventId } from "../utils/events";
import { calculateConcentration } from "./calculations/concentration";
import { updateFixedYield } from "./calculations/fixed-yield";
import { calculateTotalUnderlyingNeeded } from "./calculations/needed-underlying";
import { bondMaturedEvent } from "./events/bondmatured";
import { bondRedeemedEvent } from "./events/bondredeemed";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { underlyingAssetTopUpEvent } from "./events/underlyingassettopup";
import { underlyingAssetWithdrawnEvent } from "./events/underlyingassetwithdrawn";
import { userBlockedEvent } from "./events/userblocked";
import { userUnblockedEvent } from "./events/userunblocked";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchBond } from "./fetch/bond";
import { approvalHandler } from "./handlers/approval";
import { burnHandler } from "./handlers/burn";
import { mintHandler } from "./handlers/mint";
import { pauseHandler } from "./handlers/pause";
import { roleGrantedHandler } from "./handlers/role-granted";
import { roleRevokedHandler } from "./handlers/role-revoked";
import { transferHandler } from "./handlers/transfer";
import { unPauseHandler } from "./handlers/unpause";
import { newAssetStatsData } from "./stats/assets";

export function handleTransfer(event: Transfer): void {
  const bond = fetchBond(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = bond.decimals;

  if (from.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Mint, [to]);
    mintHandler(
      bond,
      bond.id,
      AssetType.bond,
      event.block.timestamp,
      to,
      value,
      decimals,
      false
    );
  } else if (to.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Burn, [event.params.from]);
    burnHandler(
      bond,
      bond.id,
      AssetType.bond,
      event.block.timestamp,
      event.params.from,
      event.params.value,
      decimals,
      false
    );
  } else {
    createActivityLogEntry(event, EventType.Transfer, [
      event.params.from,
      event.params.to,
    ]);
    transferHandler(
      bond,
      bond.id,
      AssetType.bond,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false
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

  createActivityLogEntry(event, EventType.RoleGranted, [
    roleHolder,
    event.params.sender,
  ]);
  roleGrantedHandler(bond, role, roleHolder);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const bond = fetchBond(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;

  createActivityLogEntry(event, EventType.RoleRevoked, [
    roleHolder,
    event.params.sender,
  ]);
  roleRevokedHandler(bond, role, roleHolder);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.RoleAdminChanged, []);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);
  approvalHandler(
    bond.id,
    event.params.value,
    bond.decimals,
    false,
    event.block.timestamp,
    event.params.owner
  );
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Pause, [event.params.account]);
  const holders = bond.holders.load();
  pauseHandler(bond, bond.id, AssetType.bond, bond.decimals, false, holders);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleUnpaused(event: Unpaused): void {
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Pause, [event.params.account]);
  const holders = bond.holders.load();
  unPauseHandler(bond, bond.id, AssetType.bond, bond.decimals, false, holders);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleClawback(event: Clawback): void {
  // This event is sent together with a transfer event, so we do not need to handle balances
  const bond = fetchBond(event.address);
  createActivityLogEntry(event, EventType.Clawback, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
}

export function handleBondMatured(event: BondMatured): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);

  bond.isMatured = true;
  bond.lastActivity = event.block.timestamp;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  bond.save();

  bondMaturedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id
  );
}

export function handleBondRedeemed(event: BondRedeemed): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const holder = fetchAccount(event.params.holder);

  // Update bond's redeemed amount
  bond.redeemedAmount = bond.redeemedAmount.plus(event.params.bondAmount);
  bond.underlyingBalanceExact = bond.underlyingBalanceExact.minus(
    event.params.underlyingAmount
  );

  const underlyingDecimals = bond.underlyingAssetDecimals;
  bond.underlyingBalance = toDecimals(
    bond.underlyingBalanceExact,
    underlyingDecimals
  );

  bond.lastActivity = event.block.timestamp;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  bond.save();

  bondRedeemedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    holder.id,
    event.params.bondAmount,
    event.params.underlyingAmount,
    bond.decimals
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Bond tokens frozen event: amount={}, user={}, sender={}, bond={}", [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const assetStats = newAssetStatsData(bond.id, AssetType.bond);
  assetStats.frozen = toDecimals(event.params.amount, bond.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.bond);
  increase(assetActivity, "frozenEventCount");
  assetActivity.save();

  const balance = fetchAssetBalance(bond.id, user.id, bond.decimals, false);
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(event.params.amount, bond.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  bond.lastActivity = event.block.timestamp;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  bond.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    user.id,
    event.params.amount,
    bond.decimals
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  bond.lastActivity = event.block.timestamp;
  blockUser(bond.id, user.id, event.block.timestamp);
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  bond.save();

  const balance = fetchAssetBalance(bond.id, user.id, bond.decimals, false);
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  log.info("Bond user blocked event: user={}, sender={}, bond={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  userBlockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    user.id
  );
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  bond.lastActivity = event.block.timestamp;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  unblockUser(bond.id, user.id);
  bond.save();

  const balance = fetchAssetBalance(bond.id, user.id, bond.decimals, false);
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  log.info("Bond user unblocked event: user={}, sender={}, bond={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  userUnblockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.bond,
    user.id
  );
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUp): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);

  log.info(
    "Bond underlying asset top up event: amount={}, from={}, sender={}, bond={}",
    [
      event.params.amount.toString(),
      from.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  bond.underlyingBalanceExact = bond.underlyingBalanceExact.plus(
    event.params.amount
  );

  const underlyingDecimals = bond.underlyingAssetDecimals;
  bond.underlyingBalance = toDecimals(
    bond.underlyingBalanceExact,
    underlyingDecimals
  );

  bond.lastActivity = event.block.timestamp;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  bond.save();

  underlyingAssetTopUpEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    from.id,
    event.params.amount,
    bond.decimals
  );
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawn
): void {
  const bond = fetchBond(event.address);
  const sender = fetchAccount(event.transaction.from);
  const to = fetchAccount(event.params.to);

  log.info(
    "Bond underlying asset withdrawn event: amount={}, to={}, sender={}, bond={}",
    [
      event.params.amount.toString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  bond.underlyingBalanceExact = bond.underlyingBalanceExact.minus(
    event.params.amount
  );

  const underlyingDecimals = bond.underlyingAssetDecimals;
  bond.underlyingBalance = toDecimals(
    bond.underlyingBalanceExact,
    underlyingDecimals
  );

  bond.lastActivity = event.block.timestamp;
  updateDerivedFieldsAndSave(bond, event.block.timestamp);
  bond.save();

  underlyingAssetWithdrawnEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    to.id,
    event.params.amount,
    bond.decimals
  );
}
