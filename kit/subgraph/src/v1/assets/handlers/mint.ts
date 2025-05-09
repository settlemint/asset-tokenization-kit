import {
  Address,
  BigInt,
  Bytes,
  Entity,
  ethereum,
} from "@graphprotocol/graph-ts";
import { Account, AssetBalance } from "../../../../generated/schema";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { fetchAssetBalance, hasBalance } from "../../utils/balance";
import { increase } from "../../utils/counters";
import { setValueWithDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { fetchAssetActivity } from "../fetch/assets";
import { newAssetStatsData } from "../stats/assets";
import { newPortfolioStatsData } from "../stats/portfolio";

export function mintHandler(
  event: ethereum.Event,
  asset: Entity,
  assetAddress: Bytes,
  assetType: string,
  timestamp: BigInt,
  to: Address,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.Mint, sender, [to]);
  // increase total supply
  const newTotalSupply = handleTotalSupply(asset, value, decimals);
  // increase total minted
  handleTotalMinted(asset, value, decimals);
  // update asset activity
  handleAssetActivity(assetType, newTotalSupply, decimals);
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
  const balance = handleToBalance(
    assetAddress,
    toAccount,
    value,
    decimals,
    timestamp,
    initialBlockedState
  );
  // update portfolio stats
  handlePortfolioStats(toAccount, assetAddress, balance, decimals);
  // update asset stats
  handleAssetStats(assetAddress, assetType, value, decimals);
}

function handleTotalSupply(
  asset: Entity,
  value: BigInt,
  decimals: number
): BigInt {
  let totalSupply = BigInt.zero();
  let totalSupplyValue = asset.get("totalSupplyExact");
  if (totalSupplyValue) {
    totalSupply = totalSupplyValue.toBigInt();
  }

  const newTotalSupply = totalSupply.plus(value);
  setValueWithDecimals(asset, "totalSupply", newTotalSupply, decimals);
  return newTotalSupply;
}

function handleTotalMinted(
  asset: Entity,
  value: BigInt,
  decimals: number
): void {
  let totalMinted = BigInt.zero();
  let totalMintedValue = asset.get("totalMintedExact");
  if (totalMintedValue) {
    totalMinted = totalMintedValue.toBigInt();
  }
  const newTotalMinted = totalMinted.plus(value);
  setValueWithDecimals(asset, "totalMinted", newTotalMinted, decimals);
}

function handleAssetActivity(
  assetType: string,
  newTotalSupply: BigInt,
  decimals: number
): void {
  const assetActivity = fetchAssetActivity(assetType);
  setValueWithDecimals(assetActivity, "totalSupply", newTotalSupply, decimals);
  increase(assetActivity, "mintEventCount");
  assetActivity.save();
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
  toAccount: Account,
  assetAddress: Bytes,
  balance: AssetBalance,
  decimals: number
): void {
  const portfolioStats = newPortfolioStatsData(
    toAccount.id,
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
  setValueWithDecimals(assetStats, "minted", value, decimals);
  let supply = assetStats.supplyExact.plus(value);
  setValueWithDecimals(assetStats, "supply", supply, decimals);
  assetStats.save();
}
