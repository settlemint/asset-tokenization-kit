import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
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
import { fetchAssetBalance, hasBalance } from "../fetch/balance";
import { decrease, increase } from "../utils/counters";
import { toDecimals } from "../utils/decimals";
import { AssetType } from "../utils/enums";
import { eventId } from "../utils/events";
import { calculateCollateral } from "./calculations/collateral";
import { calculateConcentration } from "./calculations/concentration";
import { clawbackEvent } from "./events/clawback";
import { collateralUpdatedEvent } from "./events/collateralupdated";
import { pausedEvent } from "./events/paused";
import { tokensFrozenEvent } from "./events/tokensfrozen";
import { unpausedEvent } from "./events/unpaused";
import { userAllowedEvent } from "./events/userallowed";
import { userDisallowedEvent } from "./events/userdisallowed";
import { fetchAssetCount } from "./fetch/asset-count";
import { fetchAssetActivity } from "./fetch/assets";
import { fetchDeposit } from "./fetch/deposit";
import { approvalHandler } from "./handlers/approval";
import { burnHandler } from "./handlers/burn";
import { mintHandler } from "./handlers/mint";
import { roleGrantedHandler } from "./handlers/role-granted";
import { roleRevokedHandler } from "./handlers/role-revoked";
import { transferHandler } from "./handlers/transfer";
import { newAssetStatsData } from "./stats/assets";
import { newPortfolioStatsData } from "./stats/portfolio";

export function handleTransfer(event: Transfer): void {
  const deposit = fetchDeposit(event.address);
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const decimals = deposit.decimals;

  if (from.equals(Address.zero())) {
    createActivityLogEntry(event, EventType.Mint, [to]);
    mintHandler(
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
    createActivityLogEntry(event, EventType.Burn, [event.params.from]);
    burnHandler(
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
    createActivityLogEntry(event, EventType.Transfer, [
      event.params.from,
      event.params.to,
    ]);
    transferHandler(
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

  createActivityLogEntry(event, EventType.RoleGranted, [
    roleHolder,
    event.params.sender,
  ]);
  roleGrantedHandler(deposit, role, roleHolder);
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const deposit = fetchDeposit(event.address);
  const role = event.params.role.toHexString();
  const roleHolder = event.params.account;

  createActivityLogEntry(event, EventType.RoleRevoked, [
    roleHolder,
    event.params.sender,
  ]);
  roleRevokedHandler(deposit, role, roleHolder);
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
  createActivityLogEntry(event, EventType.Approval, [
    event.params.owner,
    event.params.spender,
  ]);
  approvalHandler(
    deposit.id,
    event.params.value,
    deposit.decimals,
    false,
    event.block.timestamp,
    event.params.owner
  );
  updateDerivedFieldsAndSave(deposit, event.block.timestamp);
}

export function handlePaused(event: Paused): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Deposit paused event: sender={}, token={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.paused = true;
  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  const assetCount = fetchAssetCount(AssetType.deposit);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();

  const holders = deposit.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(deposit.id, assetBalance.account, deposit.decimals, true)) {
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

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  pausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit
  );
}

export function handleUnpaused(event: Unpaused): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);

  log.info("Deposit unpaused event: sender={}, token={}", [
    sender.id.toHexString(),
    event.address.toHexString(),
  ]);

  deposit.paused = false;
  deposit.lastActivity = event.block.timestamp;
  deposit.save();

  const assetCount = fetchAssetCount(AssetType.deposit);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();

  const holders = deposit.holders.load();
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (hasBalance(deposit.id, assetBalance.account, deposit.decimals, true)) {
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

  const assetActivity = fetchAssetActivity(AssetType.deposit);
  assetActivity.save();

  unpausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit
  );
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

export function handleClawback(event: Clawback): void {
  const deposit = fetchDeposit(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const to = fetchAccount(event.params.to);
  const assetActivity = fetchAssetActivity(AssetType.deposit);

  const assetStats = newAssetStatsData(deposit.id, AssetType.deposit);

  // Create clawback event record
  const clawback = clawbackEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.deposit,
    from.id,
    to.id,
    event.params.amount,
    deposit.decimals
  );

  log.info(
    "Deposit clawback event: amount={}, from={}, to={}, sender={}, deposit={}",
    [
      clawback.amount.toString(),
      clawback.from.toHexString(),
      clawback.to.toHexString(),
      clawback.sender.toHexString(),
      event.address.toHexString(),
    ]
  );

  if (!hasBalance(deposit.id, to.id, deposit.decimals, true)) {
    increase(deposit, "totalHolders");
    increase(to, "balancesCount");
  }

  to.totalBalanceExact = to.totalBalanceExact.plus(clawback.amountExact);
  to.totalBalance = toDecimals(to.totalBalanceExact, 18);
  to.save();

  from.totalBalanceExact = from.totalBalanceExact.minus(clawback.amountExact);
  from.totalBalance = toDecimals(from.totalBalanceExact, 18);
  from.save();

  const fromBalance = fetchAssetBalance(
    deposit.id,
    from.id,
    deposit.decimals,
    true
  );
  fromBalance.valueExact = fromBalance.valueExact.minus(clawback.amountExact);
  fromBalance.value = toDecimals(fromBalance.valueExact, deposit.decimals);
  fromBalance.lastActivity = event.block.timestamp;
  fromBalance.save();

  if (fromBalance.valueExact.equals(BigInt.zero())) {
    decrease(deposit, "totalHolders");
    store.remove("AssetBalance", fromBalance.id.toHexString());
    decrease(from, "balancesCount");
    from.save();
  }

  const fromPortfolioStats = newPortfolioStatsData(
    from.id,
    deposit.id,
    AssetType.deposit
  );
  fromPortfolioStats.balance = fromBalance.value;
  fromPortfolioStats.balanceExact = fromBalance.valueExact;
  fromPortfolioStats.save();

  const toBalance = fetchAssetBalance(
    deposit.id,
    to.id,
    deposit.decimals,
    true
  );
  toBalance.valueExact = toBalance.valueExact.plus(clawback.amountExact);
  toBalance.value = toDecimals(toBalance.valueExact, deposit.decimals);
  toBalance.lastActivity = event.block.timestamp;
  toBalance.save();

  const toPortfolioStats = newPortfolioStatsData(
    to.id,
    deposit.id,
    AssetType.deposit
  );
  toPortfolioStats.balance = toBalance.value;
  toPortfolioStats.balanceExact = toBalance.valueExact;
  toPortfolioStats.save();

  // Update asset stats for clawback event
  assetStats.volume = clawback.amount;
  assetStats.volumeExact = clawback.amountExact;
  increase(assetActivity, "clawbackEventCount");

  // Update deposit state
  deposit.lastActivity = event.block.timestamp;
  deposit.concentration = calculateConcentration(
    deposit.holders.load(),
    deposit.totalSupplyExact
  );

  // Update collateral calculated fields
  depositCollateralCalculatedFields(deposit);
  deposit.save();

  // Update asset stats
  assetStats.supply = deposit.totalSupply;
  assetStats.supplyExact = deposit.totalSupplyExact;
  updateDepositCollateralData(assetStats, deposit);
  assetStats.save();

  assetActivity.save();
}
