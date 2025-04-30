import { Address, ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import {
  Approval,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
} from "../../generated/templates/CryptoCurrency/CryptoCurrency";
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { fetchAssetBalance } from "../fetch/balance";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { calculateConcentration } from "./calculations/concentration";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchCryptoCurrency } from "./fetch/cryptocurrency";
import { burnHandler } from "./handlers/burn";
import { mintHandler } from "./handlers/mint";
import { transferHandler } from "./handlers/transfer";
import { newAssetStatsData } from "./stats/assets";

export function handleTransfer(event: Transfer): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const assetActivity = fetchAssetActivity(AssetType.cryptocurrency);

  const assetStats = newAssetStatsData(
    cryptoCurrency.id,
    AssetType.cryptocurrency
  );

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

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.concentration = calculateConcentration(
    cryptoCurrency.holders.load(),
    cryptoCurrency.totalSupplyExact
  );
  cryptoCurrency.save();

  assetStats.supply = cryptoCurrency.totalSupply;
  assetStats.supplyExact = cryptoCurrency.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleGranted, [event.params.account]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < cryptoCurrency.admins.length; i++) {
      if (cryptoCurrency.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      cryptoCurrency.admins = cryptoCurrency.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < cryptoCurrency.supplyManagers.length; i++) {
      if (cryptoCurrency.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      cryptoCurrency.supplyManagers = cryptoCurrency.supplyManagers.concat([
        account.id,
      ]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < cryptoCurrency.userManagers.length; i++) {
      if (cryptoCurrency.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      cryptoCurrency.userManagers = cryptoCurrency.userManagers.concat([
        account.id,
      ]);
    }
  }

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleRevoked, [event.params.account]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.admins.length; i++) {
      if (!cryptoCurrency.admins[i].equals(account.id)) {
        newAdmins.push(cryptoCurrency.admins[i]);
      }
    }
    cryptoCurrency.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.supplyManagers.length; i++) {
      if (!cryptoCurrency.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(cryptoCurrency.supplyManagers[i]);
      }
    }
    cryptoCurrency.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < cryptoCurrency.userManagers.length; i++) {
      if (!cryptoCurrency.userManagers[i].equals(account.id)) {
        newUserManagers.push(cryptoCurrency.userManagers[i]);
      }
    }
    cryptoCurrency.userManagers = newUserManagers;
  }

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();
}

export function handleApproval(event: Approval): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);
  const sender = fetchAccount(event.transaction.from);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(
    cryptoCurrency.id,
    owner.id,
    cryptoCurrency.decimals,
    false
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(
    event.params.value,
    cryptoCurrency.decimals
  );
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const cryptoCurrency = fetchCryptoCurrency(event.address);

  createActivityLogEntry(event, EventType.RoleAdminChanged, []);

  cryptoCurrency.lastActivity = event.block.timestamp;
  cryptoCurrency.save();
}
