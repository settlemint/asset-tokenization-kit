import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DvPSwap } from "../../generated/schema";
import { fetchAccount } from "./account";

export function fetchDvPSwap(address: Address, timestamp: BigInt | null = null): DvPSwap {
  let dvpSwap = DvPSwap.load(address);

  if (!dvpSwap) {
    dvpSwap = new DvPSwap(address);
    
    const creator = fetchAccount(address); // The contract itself is the creator at first
    dvpSwap.creator = creator.id;
    dvpSwap.createdAt = timestamp ? timestamp : BigInt.zero();
    dvpSwap.active = true;
    dvpSwap.swapCount = 0;
    dvpSwap.totalValueLocked = BigInt.zero().toBigDecimal();
    dvpSwap.totalValueLockedExact = BigInt.zero();
    
    dvpSwap.save();
  }

  return dvpSwap;
}

export function updateDvPSwapCreator(dvpSwapId: Bytes, creator: Address): void {
  const dvpSwap = DvPSwap.load(dvpSwapId);
  
  if (dvpSwap) {
    const creatorAccount = fetchAccount(creator);
    dvpSwap.creator = creatorAccount.id;
    dvpSwap.save();
  }
} 