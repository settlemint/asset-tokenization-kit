/**
 *
 * type PortfolioStatsData @entity(timeseries: true) {
  id: Int8!
  timestamp: Timestamp!
  ## Filters
  account: Account!
  assetType: AssetType!
  asset: Asset!
  ## Balances
  balance: BigDecimal!
  balanceExact: BigInt!
  ## Frozen
  locked: BigDecimal!
  lockedExact: BigInt!
}
 *
 *
 */

import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { PortfolioStatsData } from "../../../../generated/schema";

export function newPortfolioStatsData(
  account: Bytes,
  asset: Bytes,
  assetType: string
): PortfolioStatsData {
  const portfolioStats = new PortfolioStatsData(1); // id is set by the indexer

  // Filters
  portfolioStats.account = account;
  portfolioStats.asset = asset;
  portfolioStats.assetType = assetType;

  // Balances
  portfolioStats.balance = BigDecimal.zero();
  portfolioStats.balanceExact = BigInt.zero();

  // Frozen
  portfolioStats.locked = BigDecimal.zero();
  portfolioStats.lockedExact = BigInt.zero();

  return portfolioStats;
}
