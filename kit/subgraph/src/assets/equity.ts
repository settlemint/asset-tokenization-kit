import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  log,
  store,
} from "@graphprotocol/graph-ts";
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
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { blockUser, unblockUser } from "../fetch/block-user";
import { decrease, increase } from "../utils/counters";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { eventId } from "../utils/events";
import { calculateConcentration } from "./calculations/concentration";
import { clawbackEvent } from "./events/clawback";
import { pausedEvent } from "./events/paused";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { unpausedEvent } from "./events/unpaused";
import { userBlockedEvent } from "./events/userblocked";
import { userUnblockedEvent } from "./events/userunblocked";
import { fetchAssetCount } from "./fetch/asset-count";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchEquity } from "./fetch/equity";
import { burnHandler } from "./handlers/burn";
import { mintHandler } from "./handlers/mint";
import { transferHandler } from "./handlers/transfer";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const equity = fetchEquity(event.address);
  const assetActivity = fetchAssetActivity(AssetType.equity);

  const assetStats = newAssetStatsData(
    equity.id,
    AssetType.equity,
    equity.equityCategory,
    equity.equityClass
  );

  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = equity.decimals;

  if (from.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Mint, [to]);
    mintHandler(
      equity,
      equity.id,
      AssetType.equity,
      event.block.timestamp,
      to,
      value,
      decimals,
      false
    );
  } else if (to.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Burn, [event.params.from]);
    burnHandler(
      equity,
      equity.id,
      AssetType.equity,
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
      equity,
      equity.id,
      AssetType.equity,
      event.block.timestamp,
      event.params.from,
      event.params.to,
      event.params.value,
      decimals,
      false
    );
  }

  equity.lastActivity = event.block.timestamp;
  equity.concentration = calculateConcentration(
    equity.holders.load(),
    equity.totalSupplyExact
  );
  equity.save();

  assetStats.supply = equity.totalSupply;
  assetStats.supplyExact = equity.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const equity = fetchEquity(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleGranted, [event.params.account]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < equity.admins.length; i++) {
      if (equity.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      equity.admins = equity.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < equity.supplyManagers.length; i++) {
      if (equity.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      equity.supplyManagers = equity.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < equity.userManagers.length; i++) {
      if (equity.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      equity.userManagers = equity.userManagers.concat([account.id]);
    }
  }

  equity.lastActivity = event.block.timestamp;
  equity.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const equity = fetchEquity(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleRevoked, [event.params.account]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < equity.admins.length; i++) {
      if (!equity.admins[i].equals(account.id)) {
        newAdmins.push(equity.admins[i]);
      }
    }
    equity.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < equity.supplyManagers.length; i++) {
      if (!equity.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(equity.supplyManagers[i]);
      }
    }
    equity.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < equity.userManagers.length; i++) {
      if (!equity.userManagers[i].equals(account.id)) {
        newUserManagers.push(equity.userManagers[i]);
      }
    }
    equity.userManagers = newUserManagers;
  }

  equity.lastActivity = event.block.timestamp;
  equity.save();
}

export function handleApproval(event: Approval): void {
  const equity = fetchEquity(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);
  const sender = fetchAccount(event.transaction.from);

  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(
    equity.id,
    owner.id,
    equity.decimals,
    false
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, equity.decimals);
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);

  equity.lastActivity = event.block.timestamp;
  equity.save();
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  createActivityLogEntry(event, EventType.RoleAdminChanged, []);

  equity.lastActivity = event.block.timestamp;
  equity.save();
}

export function handlePaused(event: Paused): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Equity paused event: sender={}, equity={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.paused = true;
  equity.lastActivity = event.block.timestamp;
  equity.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();

  const holders = equity.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(equity.id, assetBalance.account, equity.decimals, false)) {
      const holderAccount =
        sender.id == assetBalance.account
          ? sender
          : fetchAccount(Address.fromBytes(assetBalance.account));
      holderAccount.pausedBalancesCount = holderAccount.pausedBalancesCount + 1;
      holderAccount.pausedBalanceExact = holderAccount.pausedBalanceExact.plus(
        assetBalance.valueExact
      );
      holderAccount.pausedBalance = toDecimals(
        holderAccount.pausedBalanceExact,
        18
      );
      log.info(
        "Updated holder account: id={}, pausedBalancesCount={}, pausedBalance={}",
        [
          holderAccount.id.toHexString(),
          holderAccount.pausedBalancesCount.toString(),
          holderAccount.pausedBalance.toString(),
        ]
      );
      holderAccount.save();
    }
  }

  pausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity
  );
}

export function handleUnpaused(event: Unpaused): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Equity unpaused event: sender={}, equity={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.paused = false;
  equity.lastActivity = event.block.timestamp;
  equity.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();

  const holders = equity.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(equity.id, assetBalance.account, equity.decimals, false)) {
      const holderAccount =
        sender.id == assetBalance.account
          ? sender
          : fetchAccount(Address.fromBytes(assetBalance.account));
      holderAccount.pausedBalancesCount = holderAccount.pausedBalancesCount - 1;
      holderAccount.pausedBalanceExact = holderAccount.pausedBalanceExact.minus(
        assetBalance.valueExact
      );
      holderAccount.pausedBalance = toDecimals(
        holderAccount.pausedBalanceExact,
        18
      );
      log.info(
        "Updated holder account: id={}, pausedBalancesCount={}, pausedBalance={}",
        [
          holderAccount.id.toHexString(),
          holderAccount.pausedBalancesCount.toString(),
          holderAccount.pausedBalance.toString(),
        ]
      );
      holderAccount.save();
    }
  }

  unpausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info(
    "Equity tokens frozen event: amount={}, user={}, sender={}, equity={}",
    [
      event.params.amount.toString(),
      user.id.toHexString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  const balance = fetchAssetBalance(equity.id, user.id, equity.decimals, false);
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(event.params.amount, equity.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    equity.id,
    AssetType.equity,
    equity.equityCategory,
    equity.equityClass
  );
  assetStats.frozen = toDecimals(event.params.amount, equity.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.equity);
  increase(assetActivity, "frozenEventCount");
  assetActivity.save();
  equity.lastActivity = event.block.timestamp;
  equity.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    user.id,
    event.params.amount,
    equity.decimals
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Equity user blocked event: user={}, sender={}, equity={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.lastActivity = event.block.timestamp;
  blockUser(equity.id, user.id, event.block.timestamp);
  equity.save();

  const balance = fetchAssetBalance(equity.id, user.id, equity.decimals, false);
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  userBlockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    user.id
  );
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Equity user unblocked event: user={}, sender={}, equity={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  equity.lastActivity = event.block.timestamp;
  unblockUser(equity.id, user.id);
  equity.save();

  const balance = fetchAssetBalance(equity.id, user.id, equity.decimals, false);
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  userUnblockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    user.id
  );
}

export function handleClawback(event: Clawback): void {
  const equity = fetchEquity(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const to = fetchAccount(event.params.to);
  const assetActivity = fetchAssetActivity(AssetType.equity);

  const assetStats = newAssetStatsData(
    equity.id,
    AssetType.equity,
    equity.equityCategory,
    equity.equityClass
  );

  // Create clawback event record
  const clawback = clawbackEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.equity,
    from.id,
    to.id,
    event.params.amount,
    equity.decimals
  );

  log.info(
    "Equity clawback event: amount={}, from={}, to={}, sender={}, equity={}",
    [
      clawback.amount.toString(),
      clawback.from.toHexString(),
      clawback.to.toHexString(),
      clawback.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  if (!hasBalance(equity.id, to.id, equity.decimals, false)) {
    increase(equity, "totalHolders");
    increase(to, "balancesCount");
  }

  to.totalBalanceExact = to.totalBalanceExact.plus(clawback.amountExact);
  to.totalBalance = toDecimals(to.totalBalanceExact, 18);
  to.save();

  from.totalBalanceExact = from.totalBalanceExact.minus(clawback.amountExact);
  from.totalBalance = toDecimals(from.totalBalanceExact, 18);
  from.save();

  const fromBalance = fetchAssetBalance(
    equity.id,
    from.id,
    equity.decimals,
    false
  );
  fromBalance.valueExact = fromBalance.valueExact.minus(clawback.amountExact);
  fromBalance.value = toDecimals(fromBalance.valueExact, equity.decimals);
  fromBalance.lastActivity = event.block.timestamp;
  fromBalance.save();

  if (fromBalance.valueExact.equals(BigInt.zero())) {
    decrease(equity, "totalHolders");
    store.remove("AssetBalance", fromBalance.id.toHexString());
    decrease(from, "balancesCount");
    from.save();
  }

  const fromPortfolioStats = newPortfolioStatsData(
    from.id,
    equity.id,
    AssetType.equity
  );
  fromPortfolioStats.balance = fromBalance.value;
  fromPortfolioStats.balanceExact = fromBalance.valueExact;
  fromPortfolioStats.save();

  const toBalance = fetchAssetBalance(equity.id, to.id, equity.decimals, false);
  toBalance.valueExact = toBalance.valueExact.plus(clawback.amountExact);
  toBalance.value = toDecimals(toBalance.valueExact, equity.decimals);
  toBalance.lastActivity = event.block.timestamp;
  toBalance.save();

  const toPortfolioStats = newPortfolioStatsData(
    to.id,
    equity.id,
    AssetType.equity
  );
  toPortfolioStats.balance = toBalance.value;
  toPortfolioStats.balanceExact = toBalance.valueExact;
  toPortfolioStats.save();

  // Update asset stats for clawback event
  assetStats.volume = clawback.amount;
  assetStats.volumeExact = clawback.amountExact;
  increase(assetActivity, "clawbackEventCount");

  equity.lastActivity = event.block.timestamp;
  equity.concentration = calculateConcentration(
    equity.holders.load(),
    equity.totalSupplyExact
  );
  equity.save();

  assetStats.supply = equity.totalSupply;
  assetStats.supplyExact = equity.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}
