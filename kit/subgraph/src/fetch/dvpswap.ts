import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DvPSwap, Swap } from "../../generated/schema";
import { SwapStatusType } from "../utils/enums";
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

// Moved from swap.ts to consolidate DvP swap-related functionality
export function fetchSwap(swapId: Bytes, contractAddress: Address, timestamp: BigInt | null = null): Swap {
  let swap = Swap.load(swapId);

  if (!swap) {
    swap = new Swap(swapId);
    
    const dvpSwap = fetchDvPSwap(contractAddress, timestamp);
    swap.contract = dvpSwap.id;
    swap.factory = null; // Will be set if created via factory
    
    // Default values, will be updated by event handler
    const zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
    swap.creator = fetchAccount(zeroAddress).id;
    swap.sender = fetchAccount(zeroAddress).id;
    swap.receiver = fetchAccount(zeroAddress).id;
    swap.tokenToSend = zeroAddress;
    swap.tokenToReceive = zeroAddress;
    swap.amountToSend = BigInt.zero().toBigDecimal();
    swap.amountToSendExact = BigInt.zero();
    swap.amountToReceive = BigInt.zero().toBigDecimal();
    swap.amountToReceiveExact = BigInt.zero();
    swap.timelock = BigInt.zero();
    swap.hashlock = Bytes.empty();
    swap.status = SwapStatusType.PendingCreation;
    swap.createdAt = timestamp ? timestamp : BigInt.zero();
    swap.maxDuration = BigInt.zero();
    swap.updatedAt = timestamp ? timestamp : BigInt.zero();
    
    // Increment swap count
    dvpSwap.swapCount = dvpSwap.swapCount + 1;
    dvpSwap.save();
    
    swap.save();
  }

  return swap;
} 