import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DvPSwapStatsData } from "../../generated/schema";

let nextDvPSwapStatsDataId = 0;

export function newDvPSwapStatsData(dvpSwapId: Bytes): DvPSwapStatsData {
  const stats = new DvPSwapStatsData(nextDvPSwapStatsDataId);
  nextDvPSwapStatsDataId++;
  
  stats.dvpSwap = dvpSwapId;
  stats.swapsCreated = 0;
  stats.swapsClaimed = 0;
  stats.swapsRefunded = 0;
  stats.swapsExpired = 0;
  stats.swapsFailed = 0;
  stats.valueLockedExact = BigInt.zero();
  stats.valueLocked = BigInt.zero().toBigDecimal();
  
  return stats;
} 