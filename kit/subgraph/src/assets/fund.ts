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
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { blockUser, unblockUser } from "../fetch/block-user";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { eventId } from "../utils/events";
import { calculateConcentration } from "./calculations/concentration";
import { clawbackEvent } from "./events/clawback";
import { managementFeeCollectedEvent } from "./events/managementfeecollected";
import { pausedEvent } from "./events/paused";
import { performanceFeeCollectedEvent } from "./events/performancefeecollected";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { tokenWithdrawnEvent } from "./events/tokenwithdrawn";
import { unpausedEvent } from "./events/unpaused";
import { userBlockedEvent } from "./events/userblocked";
import { userUnblockedEvent } from "./events/userunblocked";
import { fetchAssetCount } from "./fetch/asset-count";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchFund } from "./fetch/fund";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const assetActivity = fetchAssetActivity(AssetType.fund);

  const assetStats = newAssetStatsData(
    fund.id,
    AssetType.fund,
    fund.fundCategory,
    fund.fundClass
  );

  if (event.params.from.equals(Address.zero())) {
    const to = fetchAccount(event.params.to);

    createActivityLogEntry(event, EventType.Mint, [event.params.to]);

    // increase total supply
    fund.totalSupplyExact = fund.totalSupplyExact.plus(event.params.value);
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);
    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.plus(
      event.params.value
    );
    assetActivity.totalSupply = toDecimals(
      assetActivity.totalSupplyExact,
      fund.decimals
    );

    if (!hasBalance(fund.id, to.id, fund.decimals, false)) {
      fund.totalHolders = fund.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(event.params.value);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    const balance = fetchAssetBalance(fund.id, to.id, fund.decimals, false);
    balance.valueExact = balance.valueExact.plus(event.params.value);
    balance.value = toDecimals(balance.valueExact, fund.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    const portfolioStats = newPortfolioStatsData(
      to.id,
      fund.id,
      AssetType.fund
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.minted = toDecimals(event.params.value, fund.decimals);
    assetStats.mintedExact = event.params.value;
    assetActivity.mintEventCount = assetActivity.mintEventCount + 1;
  } else if (event.params.to.equals(Address.zero())) {
    const from = fetchAccount(event.params.from);

    createActivityLogEntry(event, EventType.Burn, [event.params.from]);

    // decrease total supply
    fund.totalSupplyExact = fund.totalSupplyExact.minus(event.params.value);
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);
    fund.totalBurnedExact = fund.totalBurnedExact.plus(event.params.value);
    fund.totalBurned = toDecimals(fund.totalBurnedExact, fund.decimals);

    assetActivity.totalSupplyExact = assetActivity.totalSupplyExact.minus(
      event.params.value
    );
    assetActivity.totalSupply = toDecimals(
      assetActivity.totalSupplyExact,
      fund.decimals
    );

    const balance = fetchAssetBalance(fund.id, from.id, fund.decimals, false);
    balance.valueExact = balance.valueExact.minus(event.params.value);
    balance.value = toDecimals(balance.valueExact, fund.decimals);
    balance.lastActivity = event.block.timestamp;
    balance.save();

    if (balance.valueExact.equals(BigInt.zero())) {
      fund.totalHolders = fund.totalHolders - 1;
      store.remove("AssetBalance", balance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    from.totalBalanceExact = from.totalBalanceExact.minus(event.params.value);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const portfolioStats = newPortfolioStatsData(
      from.id,
      fund.id,
      AssetType.fund
    );
    portfolioStats.balance = balance.value;
    portfolioStats.balanceExact = balance.valueExact;
    portfolioStats.save();

    assetStats.burned = toDecimals(event.params.value, fund.decimals);
    assetStats.burnedExact = event.params.value;
    assetActivity.burnEventCount = assetActivity.burnEventCount + 1;
  } else {
    // This will only execute for regular transfers (both addresses non-zero)
    const from = fetchAccount(event.params.from);
    const to = fetchAccount(event.params.to);

    createActivityLogEntry(event, EventType.Transfer, [
      event.params.from,
      event.params.to,
    ]);

    if (!hasBalance(fund.id, to.id, fund.decimals, false)) {
      fund.totalHolders = fund.totalHolders + 1;
      to.balancesCount = to.balancesCount + 1;
    }

    to.totalBalanceExact = to.totalBalanceExact.plus(event.params.value);
    to.totalBalance = toDecimals(to.totalBalanceExact, 18);
    to.save();

    from.totalBalanceExact = from.totalBalanceExact.minus(event.params.value);
    from.totalBalance = toDecimals(from.totalBalanceExact, 18);
    from.save();

    const fromBalance = fetchAssetBalance(
      fund.id,
      from.id,
      fund.decimals,
      false
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(event.params.value);
    fromBalance.value = toDecimals(fromBalance.valueExact, fund.decimals);
    fromBalance.lastActivity = event.block.timestamp;
    fromBalance.save();

    if (fromBalance.valueExact.equals(BigInt.zero())) {
      fund.totalHolders = fund.totalHolders - 1;
      store.remove("AssetBalance", fromBalance.id.toHexString());
      from.balancesCount = from.balancesCount - 1;
      from.save();
    }

    const fromPortfolioStats = newPortfolioStatsData(
      from.id,
      fund.id,
      AssetType.fund
    );
    fromPortfolioStats.balance = fromBalance.value;
    fromPortfolioStats.balanceExact = fromBalance.valueExact;
    fromPortfolioStats.save();

    const toBalance = fetchAssetBalance(fund.id, to.id, fund.decimals, false);
    toBalance.valueExact = toBalance.valueExact.plus(event.params.value);
    toBalance.value = toDecimals(toBalance.valueExact, fund.decimals);
    toBalance.lastActivity = event.block.timestamp;
    toBalance.save();

    const toPortfolioStats = newPortfolioStatsData(
      to.id,
      fund.id,
      AssetType.fund
    );
    toPortfolioStats.balance = toBalance.value;
    toPortfolioStats.balanceExact = toBalance.valueExact;
    toPortfolioStats.save();

    assetStats.transfers = assetStats.transfers + 1;
    assetStats.volume = toDecimals(event.params.value, fund.decimals);
    assetStats.volumeExact = event.params.value;
    assetActivity.transferEventCount = assetActivity.transferEventCount + 1;
  }

  fund.lastActivity = event.block.timestamp;
  fund.concentration = calculateConcentration(
    fund.holders.load(),
    fund.totalSupplyExact
  );
  fund.save();

  assetStats.supply = fund.totalSupply;
  assetStats.supplyExact = fund.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  const fund = fetchFund(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleGranted, [event.params.account]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    let found = false;
    for (let i = 0; i < fund.admins.length; i++) {
      if (fund.admins[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      fund.admins = fund.admins.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < fund.supplyManagers.length; i++) {
      if (fund.supplyManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      fund.supplyManagers = fund.supplyManagers.concat([account.id]);
    }
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    let found = false;
    for (let i = 0; i < fund.userManagers.length; i++) {
      if (fund.userManagers[i].equals(account.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      fund.userManagers = fund.userManagers.concat([account.id]);
    }
  }

  fund.lastActivity = event.block.timestamp;
  fund.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const fund = fetchFund(event.address);
  const account = fetchAccount(event.params.account);

  createActivityLogEntry(event, EventType.RoleRevoked, [event.params.account]);

  // Handle different roles
  if (
    event.params.role.toHexString() ==
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    // DEFAULT_ADMIN_ROLE
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < fund.admins.length; i++) {
      if (!fund.admins[i].equals(account.id)) {
        newAdmins.push(fund.admins[i]);
      }
    }
    fund.admins = newAdmins;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE")).toHexString()
  ) {
    // SUPPLY_MANAGEMENT_ROLE
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < fund.supplyManagers.length; i++) {
      if (!fund.supplyManagers[i].equals(account.id)) {
        newSupplyManagers.push(fund.supplyManagers[i]);
      }
    }
    fund.supplyManagers = newSupplyManagers;
  } else if (
    event.params.role.toHexString() ==
    crypto.keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE")).toHexString()
  ) {
    // USER_MANAGEMENT_ROLE
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < fund.userManagers.length; i++) {
      if (!fund.userManagers[i].equals(account.id)) {
        newUserManagers.push(fund.userManagers[i]);
      }
    }
    fund.userManagers = newUserManagers;
  }

  fund.lastActivity = event.block.timestamp;
  fund.save();
}

export function handleApproval(event: Approval): void {
  const fund = fetchFund(event.address);
  const owner = fetchAccount(event.params.owner);
  const spender = fetchAccount(event.params.spender);
  const sender = fetchAccount(event.transaction.from);
  // Update the owner's balance approved amount
  const ownerBalance = fetchAssetBalance(
    fund.id,
    owner.id,
    fund.decimals,
    false
  );
  ownerBalance.approvedExact = event.params.value;
  ownerBalance.approved = toDecimals(event.params.value, fund.decimals);
  ownerBalance.lastActivity = event.block.timestamp;
  ownerBalance.save();

  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);

  fund.lastActivity = event.block.timestamp;
  fund.save();
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const fund = fetchFund(event.address);

  createActivityLogEntry(event, EventType.RoleAdminChanged, []);

  fund.lastActivity = event.block.timestamp;
  fund.save();
}

export function handlePaused(event: Paused): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Fund paused event: sender={}, fund={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.paused = true;
  fund.lastActivity = event.block.timestamp;
  fund.save();

  const assetCount = fetchAssetCount(AssetType.fund);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();

  const holders = fund.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(fund.id, assetBalance.account, fund.decimals, false)) {
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
    AssetType.fund
  );
}

export function handleUnpaused(event: Unpaused): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Fund unpaused event: sender={}, fund={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.paused = false;
  fund.lastActivity = event.block.timestamp;
  fund.save();

  const assetCount = fetchAssetCount(AssetType.fund);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();

  const holders = fund.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(fund.id, assetBalance.account, fund.decimals, false)) {
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
    AssetType.fund
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Fund tokens frozen event: amount={}, user={}, sender={}, fund={}", [
    event.params.amount.toString(),
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals, false);
  balance.frozenExact = event.params.amount;
  balance.frozen = toDecimals(event.params.amount, fund.decimals);
  balance.lastActivity = event.block.timestamp;
  balance.save();

  const assetStats = newAssetStatsData(
    fund.id,
    AssetType.fund,
    fund.fundCategory,
    fund.fundClass
  );
  assetStats.frozen = toDecimals(event.params.amount, fund.decimals);
  assetStats.frozenExact = event.params.amount;
  assetStats.save();

  const assetActivity = fetchAssetActivity(AssetType.fund);
  assetActivity.frozenEventCount = assetActivity.frozenEventCount + 1;
  assetActivity.save();

  fund.lastActivity = event.block.timestamp;
  fund.save();

  tokensFrozenEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.fund,
    user.id,
    event.params.amount,
    fund.decimals
  );
}

export function handleUserBlocked(event: UserBlocked): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Fund user blocked event: user={}, sender={}, fund={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  blockUser(fund.id, user.id, event.block.timestamp);
  fund.save();

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals, false);
  balance.blocked = true;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  userBlockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.fund,
    user.id
  );
}

export function handleUserUnblocked(event: UserUnblocked): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const user = fetchAccount(event.params.user);

  log.info("Fund user unblocked event: user={}, sender={}, fund={}", [
    user.id.toHexString(),
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  fund.lastActivity = event.block.timestamp;
  unblockUser(fund.id, user.id);
  fund.save();

  const balance = fetchAssetBalance(fund.id, user.id, fund.decimals, false);
  balance.blocked = false;
  balance.lastActivity = event.block.timestamp;
  balance.save();

  userUnblockedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.fund,
    user.id
  );
}

export function handleManagementFeeCollected(
  event: ManagementFeeCollected
): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info(
    "Fund management fee collected event: amount={}, timestamp={}, sender={}, fund={}",
    [
      event.params.amount.toString(),
      event.params.timestamp.toString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  fund.lastActivity = event.block.timestamp;
  fund.save();

  managementFeeCollectedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.amount,
    fund.decimals
  );
}

export function handlePerformanceFeeCollected(
  event: PerformanceFeeCollected
): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info(
    "Fund performance fee collected event: amount={}, timestamp={}, sender={}, fund={}",
    [
      event.params.amount.toString(),
      event.params.timestamp.toString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  fund.lastActivity = event.block.timestamp;
  fund.save();

  performanceFeeCollectedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    event.params.amount,
    fund.decimals
  );
}

export function handleTokenWithdrawn(event: TokenWithdrawn): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const token = fetchAccount(event.params.token);
  const to = fetchAccount(event.params.to);

  log.info(
    "Fund token withdrawn event: token={}, to={}, amount={}, sender={}, fund={}",
    [
      token.id.toHexString(),
      to.id.toHexString(),
      event.params.amount.toString(),
      sender.id.toHexString(),
      event.address.toHexString(),
    ]
  );

  fund.lastActivity = event.block.timestamp;
  fund.save();

  tokenWithdrawnEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.fund,
    token.id,
    to.id,
    event.params.amount,
    fund.decimals
  );
}

export function handleClawback(event: Clawback): void {
  const fund = fetchFund(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const to = fetchAccount(event.params.to);
  const assetActivity = fetchAssetActivity(AssetType.fund);

  const assetStats = newAssetStatsData(
    fund.id,
    AssetType.fund,
    fund.fundCategory,
    fund.fundClass
  );

  // Create clawback event record
  const clawback = clawbackEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.fund,
    from.id,
    to.id,
    event.params.amount,
    fund.decimals
  );

  log.info(
    "Fund clawback event: amount={}, from={}, to={}, sender={}, fund={}",
    [
      clawback.amount.toString(),
      clawback.from.toHexString(),
      clawback.to.toHexString(),
      clawback.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  if (!hasBalance(fund.id, to.id, fund.decimals, false)) {
    fund.totalHolders = fund.totalHolders + 1;
    to.balancesCount = to.balancesCount + 1;
  }

  to.totalBalanceExact = to.totalBalanceExact.plus(clawback.amountExact);
  to.totalBalance = toDecimals(to.totalBalanceExact, 18);
  to.save();

  from.totalBalanceExact = from.totalBalanceExact.minus(clawback.amountExact);
  from.totalBalance = toDecimals(from.totalBalanceExact, 18);
  from.save();

  const fromBalance = fetchAssetBalance(fund.id, from.id, fund.decimals, false);
  fromBalance.valueExact = fromBalance.valueExact.minus(clawback.amountExact);
  fromBalance.value = toDecimals(fromBalance.valueExact, fund.decimals);
  fromBalance.lastActivity = event.block.timestamp;
  fromBalance.save();

  if (fromBalance.valueExact.equals(BigInt.zero())) {
    fund.totalHolders = fund.totalHolders - 1;
    store.remove("AssetBalance", fromBalance.id.toHexString());
    from.balancesCount = from.balancesCount - 1;
    from.save();
  }

  const fromPortfolioStats = newPortfolioStatsData(
    from.id,
    fund.id,
    AssetType.fund
  );
  fromPortfolioStats.balance = fromBalance.value;
  fromPortfolioStats.balanceExact = fromBalance.valueExact;
  fromPortfolioStats.save();

  const toBalance = fetchAssetBalance(fund.id, to.id, fund.decimals, false);
  toBalance.valueExact = toBalance.valueExact.plus(clawback.amountExact);
  toBalance.value = toDecimals(toBalance.valueExact, fund.decimals);
  toBalance.lastActivity = event.block.timestamp;
  toBalance.save();

  const toPortfolioStats = newPortfolioStatsData(
    to.id,
    fund.id,
    AssetType.fund
  );
  toPortfolioStats.balance = toBalance.value;
  toPortfolioStats.balanceExact = toBalance.valueExact;
  toPortfolioStats.save();

  // Update asset stats for clawback event
  assetStats.volume = clawback.amount;
  assetStats.volumeExact = clawback.amountExact;
  assetActivity.clawbackEventCount = assetActivity.clawbackEventCount + 1;

  // Update fund state
  fund.lastActivity = event.block.timestamp;
  fund.concentration = calculateConcentration(
    fund.holders.load(),
    fund.totalSupplyExact
  );
  fund.save();

  // Update asset stats
  assetStats.supply = fund.totalSupply;
  assetStats.supplyExact = fund.totalSupplyExact;
  assetStats.save();

  assetActivity.save();
}
