import {
  Address,
  BigInt,
  Bytes,
  Entity,
  ethereum,
  store,
} from "@graphprotocol/graph-ts";
import { Account, AssetBalance } from "../../../generated/schema";
import { fetchAccount } from "../../fetch/account";
import { createActivityLogEntry, EventType } from "../../fetch/activity-log";
import { fetchAssetBalance } from "../../fetch/balance";
import { decrease, increase } from "../../utils/counters";
import { setValueWithDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { fetchAssetActivity } from "../fetch/assets";
import { newAssetStatsData } from "../stats/assets";
import { newPortfolioStatsData } from "../stats/portfolio";

export function burnHandler(
  event: ethereum.Event,
  asset: Entity,
  assetAddress: Bytes,
  assetType: string,
  timestamp: BigInt,
  from: Address,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean
): void {
  createActivityLogEntry(event, EventType.Burn, [from]);
  // increase total supply
  const newTotalSupply = handleTotalSupply(asset, value, decimals);
  // increase total minted
  handleTotalBurned(asset, value, decimals);
  // update asset activity
  handleAssetActivity(assetType, newTotalSupply, decimals);
  // update from account
  const fromAccount = handleFromAccount(from, value, decimals);
  // update balance
  const balance = handleBalance(
    asset,
    assetAddress,
    fromAccount,
    value,
    decimals,
    timestamp,
    initialBlockedState
  );
  // update portfolio stats
  handlePortfolioStats(fromAccount, assetAddress, balance, decimals);
  // update asset stats
  handleAssetStats(asset, assetAddress, assetType, value, decimals);
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
  const newTotalSupply = totalSupply.minus(value);
  setValueWithDecimals(asset, "totalSupply", newTotalSupply, decimals);
  return newTotalSupply;
}

function handleTotalBurned(
  asset: Entity,
  value: BigInt,
  decimals: number
): void {
  let totalBurned = BigInt.zero();
  let totalBurnedValue = asset.get("totalBurnedExact");
  if (totalBurnedValue) {
    totalBurned = totalBurnedValue.toBigInt();
  }
  const newTotalBurned = totalBurned.plus(value);
  setValueWithDecimals(asset, "totalBurned", newTotalBurned, decimals);
}

function handleAssetActivity(
  assetType: string,
  newTotalSupply: BigInt,
  decimals: number
): void {
  const assetActivity = fetchAssetActivity(assetType);
  setValueWithDecimals(assetActivity, "totalSupply", newTotalSupply, decimals);
  increase(assetActivity, "burnEventCount");
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

function handleBalance(
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
  asset: Entity,
  assetAddress: Bytes,
  assetType: string,
  value: BigInt,
  decimals: number
): void {
  const assetStats = newAssetStatsData(assetAddress, assetType);
  setValueWithDecimals(assetStats, "burned", value, decimals);
  let supply = assetStats.supplyExact.minus(value);
  setValueWithDecimals(assetStats, "supply", supply, decimals);

  if (assetType === AssetType.deposit || assetType === AssetType.stablecoin) {
    assetStats.collateral = asset.getBigDecimal("collateral");
    assetStats.collateralExact = asset.getBigInt("collateralExact");
    assetStats.freeCollateral = asset.getBigDecimal("freeCollateral");
    assetStats.freeCollateralExact = asset.getBigInt("freeCollateralExact");
    assetStats.collateralRatio = asset.getBigDecimal("collateralRatio");
  }

  assetStats.save();
}
