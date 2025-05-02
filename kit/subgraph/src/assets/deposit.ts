import { Address, BigInt, log } from "@graphprotocol/graph-ts";
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
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { allowUser, disallowUser } from "../fetch/allow-user";
import { fetchAssetBalance } from "../fetch/balance";
import { increase } from "../utils/counters";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { eventId } from "../utils/events";
import { calculateCollateral } from "./calculations/collateral";
import { calculateConcentration } from "./calculations/concentration";
import { collateralUpdatedEvent } from "./events/collateralupdated";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { userAllowedEvent } from "./events/userallowed";
import { userDisallowedEvent } from "./events/userdisallowed";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchDeposit } from "./fetch/deposit";
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
      true
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
      true
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
      false
    );
  }
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
  deposit.save();
}

export function updateDerivedFieldsAndSave(
  deposit: Deposit,
  timestamp: BigInt
): void {
  calculateCollateral(
    deposit,
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
  createActivityLogEntry(event, EventType.RoleAdminChanged, []);
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
  createActivityLogEntry(event, EventType.Clawback, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info(
    "Deposit tokens frozen event: amount={}, user={}, sender={}, token={}",
    [
      event.params.amount.toString(),
      user.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(
    deposit.id,
    user.id,
    deposit.decimals,
    true
  );
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(balance.frozenExact, deposit.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  assetStats.frozen = toDecimals(event.params.amount, deposit.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  increase(assetActivity, "frozenEventCount");
  assetActivity.save();

  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    user.id,
    event.params.amount,
    deposit.decimals
  );
}

export function handleUserAllowed(event: UserAllowed): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Deposit user allowed event: user={}, sender={}, token={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.lastActivity = event.block.timestamp;
  allowUser(deposit.id, user.id, event.block.timestamp);
  deposit.save();

  const balance = fetchAssetBalance(
    deposit.id,
    user.id,
    deposit.decimals,
    true
  );
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  userAllowedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    user.id
  );
}

export function handleUserDisallowed(event: UserDisallowed): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Deposit user disallowed event: user={}, sender={}, token={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.lastActivity = event.block.timestamp;
  disallowUser(deposit.id, user.id);
  deposit.save();

  const balance = fetchAssetBalance(
    deposit.id,
    user.id,
    deposit.decimals,
    true
  );
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  userDisallowedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    user.id
  );
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const token = fetchAccount(event.params.token);
  const to = fetchAccount(event.params.to);

  log.info(
    "Deposit token withdrawn event: amount={}, token={}, to={}, sender={}, deposit={}",
    [
      event.params.amount.toString(),
      token.id.toHexString(),
      to.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  deposit.lastActivity = event.block.timestamp;
  deposit.save();
}

export function handleCollateralUpdated(event: CollateralUpdated): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info(
    "Deposit collateral updated event: oldAmount={}, newAmount={}, sender={}, deposit={}",
    [
      event.params.oldAmount.toString(),
      event.params.newAmount.toString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  deposit.collateral = toDecimals(event.params.newAmount, deposit.decimals);
  deposit.collateralExact = event.params.newAmount;
  deposit.lastActivity = event.block.timestamp;
  deposit.lastCollateralUpdate = event.block.timestamp;
  depositCollateralCalculatedFields(deposit);
  deposit.concentration = calculateConcentration(
    deposit.holders.load(),
    deposit.totalSupplyExact
  );
  deposit.save();

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);
  updateDepositCollateralData(assetStats, deposit);
  assetStats.save();

  collateralUpdatedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.oldAmount,
    event.params.newAmount,
    deposit.decimals
  );
}
