import { Address, BigInt, Bytes, Entity } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../fetch/account";
import { fetchAssetBalance, hasBalance } from "../../fetch/balance";
import { increase } from "../../utils/counters";
import { setValueWithDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { fetchAssetActivity } from "../fetch/assets";
import { newAssetStatsData } from "../stats/assets";
import { newPortfolioStatsData } from "../stats/portfolio";

export function handleMint(
  asset: Entity,
  assetAddress: Bytes,
  assetType: string,
  timestamp: BigInt,
  to: Address,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean
): void {
  const toAccount = fetchAccount(to);
  const assetActivity = fetchAssetActivity(assetType);
  const assetStats = newAssetStatsData(assetAddress, assetType);

  // increase total supply
  setValueWithDecimals(asset, "totalSupply", value, decimals);
  setValueWithDecimals(assetActivity, "totalSupply", value, decimals);

  if (!hasBalance(assetAddress, toAccount.id, decimals, initialBlockedState)) {
    increase(asset, "totalHolders");
    increase(toAccount, "balancesCount");
  }

  setValueWithDecimals(
    toAccount,
    "totalBalance",
    toAccount.totalBalanceExact.plus(value),
    decimals
  );
  toAccount.save();

  const balance = fetchAssetBalance(
    assetAddress,
    toAccount.id,
    decimals,
    false
  );
  const newBalance = balance.valueExact.plus(value);
  setValueWithDecimals(balance, "value", newBalance, decimals);

  balance.lastActivity = timestamp;
  balance.save();

  const portfolioStats = newPortfolioStatsData(
    toAccount.id,
    assetAddress,
    AssetType.bond
  );
  setValueWithDecimals(portfolioStats, "balance", balance.valueExact, decimals);
  portfolioStats.save();

  setValueWithDecimals(assetStats, "minted", value, decimals);

  increase(assetActivity, "mintEventCount");
}
