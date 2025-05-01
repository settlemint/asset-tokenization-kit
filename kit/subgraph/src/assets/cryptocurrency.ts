import { Address, BigInt } from "@graphprotocol/graph-ts";
import { CryptoCurrency } from "../../generated/schema";
import {
  Approval,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
} from "../../generated/templates/CryptoCurrency/CryptoCurrency";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { AssetType } from "../utils/enums";
import { calculateConcentration } from "./calculations/concentration";
import { fetchCryptoCurrency } from "./fetch/cryptocurrency";
import { approvalHandler } from "./handlers/approval";
import { burnHandler } from "./handlers/burn";
import { mintHandler } from "./handlers/mint";
import { roleGrantedHandler } from "./handlers/role-granted";
import { roleRevokedHandler } from "./handlers/role-revoked";
import { transferHandler } from "./handlers/transfer";

export function handleTransfer(event: Transfer): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = cryptoCurrency.decimals;

  if (from.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Mint, [to]);
    mintHandler(
      cryptoCurrency,
      cryptoCurrency.id,
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
      cryptoCurrency,
      cryptoCurrency.id,
      AssetType.cryptocurrency,
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
      cryptoCurrency,
      cryptoCurrency.id,
      AssetType.cryptocurrency,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false
    );
  }
  updateDerivedFieldsAndSave(cryptoCurrency, event.block.timestamp);
}

export function updateDerivedFieldsAndSave(
  cryptoCurrency: CryptoCurrency,
  timestamp: BigInt
): void {
  calculateConcentration(
    cryptoCurrency,
    cryptoCurrency.holders.load(),
    cryptoCurrency.totalSupplyExact
  );

  cryptoCurrency.lastActivity = timestamp;
  cryptoCurrency.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;

  createActivityLogEntry(event, EventType.RoleGranted, [
    roleHolder,
    event.params.sender,
  ]);
  roleGrantedHandler(cryptoCurrency, role, roleHolder);
  updateDerivedFieldsAndSave(cryptoCurrency, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;

  createActivityLogEntry(event, EventType.RoleRevoked, [
    roleHolder,
    event.params.sender,
  ]);
  roleRevokedHandler(cryptoCurrency, role, roleHolder);
  updateDerivedFieldsAndSave(cryptoCurrency, event.block.timestamp);
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  // Not really tracking anything here except the event, if you do this you'll need to change the frontend as well
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  createActivityLogEntry(event, EventType.RoleAdminChanged, []);
  updateDerivedFieldsAndSave(cryptoCurrency, event.block.timestamp);
}

export function handleApproval(event: Approval): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);
  approvalHandler(
    cryptoCurrency.id,
    event.params.value,
    cryptoCurrency.decimals,
    false,
    event.block.timestamp,
    event.params.owner
  );
  updateDerivedFieldsAndSave(cryptoCurrency, event.block.timestamp);
}
