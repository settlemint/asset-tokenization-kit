import {
  Address,
  BigInt,
  Bytes,
  Entity,
  ethereum,
  store,
} from "@graphprotocol/graph-ts";
import { Account, AssetBalance } from "../../../generated/schema";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { fetchAssetBalance, hasBalance } from "../../utils/balance";
import { decrease, increase } from "../../utils/counters";
import { setValueWithDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { fetchAssetActivity } from "../fetch/assets";
import { newAssetStatsData } from "../stats/assets";
import { newPortfolioStatsData } from "../stats/portfolio";

export function transferHandler(
  event: ethereum.Event,
  asset: Entity,
  assetAddress: Bytes,
  assetType: string,
  timestamp: BigInt,
  from: Address,
  to: Address,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean
): void {
  createActivityLogEntry(event, EventType.Transfer, [from, to]);
  // increase total minted
  handleTotalTransferred(asset, value, decimals);
  // update asset activity
  handleAssetActivity(assetType);
  // update from account
  const fromAccount = handleFromAccount(from, value, decimals);
  // update to account
  const toAccount = handleToAccount(
    asset,
    assetAddress,
    to,
    value,
    decimals,
    initialBlockedState
  );
  // update balance
  const balance = handleFromBalance(
    asset,
    assetAddress,
    fromAccount,
    value,
    decimals,
    timestamp,
    initialBlockedState
  );
  const toBalance = handleToBalance(
    assetAddress,
    toAccount,
    value,
    decimals,
    timestamp,
    initialBlockedState
  );
  // update portfolio stats
  handlePortfolioStats(fromAccount, assetAddress, balance, decimals);
  handlePortfolioStats(toAccount, assetAddress, toBalance, decimals);
  // update asset stats
  handleAssetStats(assetAddress, assetType, value, decimals);
}

function handleTotalTransferred(
  asset: Entity,
  value: BigInt,
  decimals: number
): void {
  let totalTransferred = BigInt.zero();
  let totalTransferredValue = asset.get("totalTransferredExact");
  if (totalTransferredValue) {
    totalTransferred = totalTransferredValue.toBigInt();
  }
  const newTotalTransferred = totalTransferred.plus(value);
  setValueWithDecimals(
    asset,
    "totalTransferred",
    newTotalTransferred,
    decimals
  );
}

function handleAssetActivity(assetType: string): void {
  const assetActivity = fetchAssetActivity(assetType);
  increase(assetActivity, "transferEventCount");
  assetActivity.save();
}

function handleFromAccount(
  from: Address,
  value: BigInt,
  decimals: number
): Account {
  const fromAccount = fetchAccount(from);

  const totalBalance = fromAccount.totalBalanceExact.minus(value);
  setValueWithDecimals(fromAccount, "totalBalance", totalBalance, decimals);

  return fromAccount;
}

function handleToAccount(
  asset: Entity,
  assetAddress: Bytes,
  to: Address,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean
): Account {
  const toAccount = fetchAccount(to);

  const totalBalance = toAccount.totalBalanceExact.plus(value);
  setValueWithDecimals(toAccount, "totalBalance", totalBalance, decimals);

  if (!hasBalance(assetAddress, toAccount.id, decimals, initialBlockedState)) {
    increase(asset, "totalHolders");
    increase(toAccount, "balancesCount");
    toAccount.save();
  }
  return toAccount;
}

function handleFromBalance(
  asset: Entity,
  assetAddress: Bytes,
  fromAccount: Account,
  value: BigInt,
  decimals: number,
  timestamp: BigInt,
  initialBlockedState: boolean
): AssetBalance {
  const balance = fetchAssetBalance(
    assetAddress,
    fromAccount.id,
    decimals,
    initialBlockedState
  );
  const newBalance = balance.valueExact.minus(value);
  setValueWithDecimals(balance, "value", newBalance, decimals);

  balance.lastActivity = timestamp;
  balance.save();

  if (balance.valueExact.equals(BigInt.zero())) {
    decrease(asset, "totalHolders");
    store.remove("AssetBalance", balance.id.toHexString());
    decrease(fromAccount, "balancesCount");
    fromAccount.save();
  }

  return balance;
}

function handleToBalance(
  assetAddress: Bytes,
  toAccount: Account,
  value: BigInt,
  decimals: number,
  timestamp: BigInt,
  initialBlockedState: boolean
): AssetBalance {
  const balance = fetchAssetBalance(
    assetAddress,
    toAccount.id,
    decimals,
    initialBlockedState
  );
  const newBalance = balance.valueExact.plus(value);
  setValueWithDecimals(balance, "value", newBalance, decimals);

  balance.lastActivity = timestamp;
  balance.save();

  return balance;
}

function handlePortfolioStats(
  account: Account,
  assetAddress: Bytes,
  balance: AssetBalance,
  decimals: number
): void {
  const portfolioStats = newPortfolioStatsData(
    account.id,
    assetAddress,
    AssetType.bond
  );
  setValueWithDecimals(portfolioStats, "balance", balance.valueExact, decimals);
  portfolioStats.save();
}

function handleAssetStats(
  assetAddress: Bytes,
  assetType: string,
  value: BigInt,
  decimals: number
): void {
  const assetStats = newAssetStatsData(assetAddress, assetType);
  setValueWithDecimals(assetStats, "volume", value, decimals);
  assetStats.save();
}
