import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DvPSwapStatsData } from "../../generated/schema";

let nextDvPSwapStatsDataId = 0;

export function newDvPSwapStatsData(dvpSwapId: Bytes): DvPSwapStatsData {
  const stats = new DvPSwapStatsData(nextDvPSwapStatsDataId);
  nextDvPSwapStatsDataId++;
  
  stats.dvpSwap = dvpSwapId;
  stats.dvpSwapsCreated = 0;
  stats.dvpSwapsClaimed = 0;
  stats.dvpSwapsRefunded = 0;
  stats.dvpSwapsExpired = 0;
  stats.dvpSwapsFailed = 0;
  stats.valueLockedExact = BigInt.zero();
  stats.valueLocked = BigInt.zero().toBigDecimal();
  stats.valueUnlockedExact = BigInt.zero();
  stats.valueUnlocked = BigInt.zero().toBigDecimal();
  
  return stats;
} 