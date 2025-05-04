import { Address, BigInt } from "@graphprotocol/graph-ts";
import { StableCoin } from "../../generated/schema";
import {
  Approval,
  Clawback,
  CollateralUpdated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokensFrozen,
  Transfer,
  Unpaused,
  UserBlocked,
  UserUnblocked,
} from "../../generated/templates/StableCoin/StableCoin";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { AssetType } from "../utils/enums";
import { calculateCollateral } from "./calculations/collateral";
import { calculateConcentration } from "./calculations/concentration";
import { fetchStableCoin } from "./fetch/stablecoin";
import { approvalHandler } from "./handlers/approval";
import { blockUserHandler, unblockUserHandler } from "./handlers/blocklist";
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
  const stableCoin = fetchStableCoin(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = stableCoin.decimals;

  if (from.equals(Address.zero())) {
    mintHandler(
      event,
      stableCoin,
      stableCoin.id,
      AssetType.stablecoin,
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
      stableCoin,
      stableCoin.id,
      AssetType.stablecoin,
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
      stableCoin,
      stableCoin.id,
      AssetType.stablecoin,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false,
      event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
    );
  }
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function updateDerivedFieldsAndSave(
  stableCoin: StableCoin,
  timestamp: BigInt
): void {
  calculateCollateral(
    stableCoin,
    stableCoin.id,
    stableCoin.collateralExact,
    stableCoin.totalSupplyExact,
    stableCoin.decimals
  );
  calculateConcentration(
    stableCoin,
    stableCoin.holders.load(),
    stableCoin.totalSupplyExact
  );

  stableCoin.lastActivity = timestamp;
  stableCoin.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const stableCoin = fetchStableCoin(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleGrantedHandler(event, stableCoin, role, roleHolder, sender);
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const stableCoin = fetchStableCoin(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;
  const sender = event.params.sender;
  roleRevokedHandler(event, stableCoin, role, roleHolder, sender);
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const stableCoin = fetchStableCoin(event.address);
  createActivityLogEntry(
    event,
    EventType.RoleAdminChanged,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const stableCoin = fetchStableCoin(event.address);
  const owner = event.params.owner;
  const spender = event.params.spender;
  approvalHandler(
    event,
    stableCoin.id,
    event.params.value,
    stableCoin.decimals,
    false,
    event.block.timestamp,
    owner,
    spender
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = event.params.account;
  const holders = stableCoin.holders.load();
  pauseHandler(
    event,
    stableCoin,
    stableCoin.id,
    AssetType.stablecoin,
    stableCoin.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleUnpaused(event: Unpaused): void {
  const stableCoin = fetchStableCoin(event.address);
  const sender = event.params.account;
  const holders = stableCoin.holders.load();
  unPauseHandler(
    event,
    stableCoin,
    stableCoin.id,
    AssetType.stablecoin,
    stableCoin.decimals,
    false,
    holders,
    sender
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleClawback(event: Clawback): void {
  // This event is sent together with a transfer event, so we do not need to handle balances
  const stableCoin = fetchStableCoin(event.address);
  createActivityLogEntry(event, EventType.Clawback, event.params.sender, [
    event.params.from,
    event.params.to,
    event.params.sender,
  ]);
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const stableCoin = fetchStableCoin(event.address);
  const user = event.params.user;
  const amount = event.params.amount;
  frozenHandler(
    event,
    stableCoin.id,
    AssetType.stablecoin,
    user,
    amount,
    stableCoin.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
}
export function handleUserBlocked(event: UserBlocked): void {
  const stableCoin = fetchStableCoin(event.address);
  const user = event.params.user;
  blockUserHandler(
    event,
    stableCoin.id,
    user,
    stableCoin.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const stableCoin = fetchStableCoin(event.address);
  const user = event.params.user;
  unblockUserHandler(
    event,
    stableCoin.id,
    user,
    stableCoin.decimals,
    false,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}

export function handleCollateralUpdated(event: CollateralUpdated): void {
  const stableCoin = fetchStableCoin(event.address);
  collateralUpdatedHandler(
    event,
    stableCoin,
    event.params.newAmount,
    stableCoin.decimals,
    event.block.timestamp,
    event.transaction.from // not perfect but the event does not have an ERC2771 sender parameter
  );
  updateDerivedFieldsAndSave(stableCoin, event.block.timestamp);
}
