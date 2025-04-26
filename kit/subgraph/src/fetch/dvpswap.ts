import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DvPSwap, DvPSwapEntity } from "../../generated/schema";
import { DvPSwapStatusType } from "../utils/enums";
import { fetchAccount } from "./account";

export function fetchDvPSwap(
  address: Address,
  timestamp: BigInt | null = null
): DvPSwap {
  let dvpSwap = DvPSwap.load(address);

  if (!dvpSwap) {
    dvpSwap = new DvPSwap(address);

    const creator = fetchAccount(address); // The contract itself is the creator at first
    dvpSwap.creator = creator.id;
    dvpSwap.createdAt = timestamp ? timestamp : BigInt.zero();
    dvpSwap.active = true;
    dvpSwap.dvpSwapCount = 0;
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

// Renamed from fetchSwap to fetchDvPSwapEntity to match entity name
export function fetchDvPSwapEntity(
  swapId: Bytes,
  contractAddress: Address,
  timestamp: BigInt | null = null
): DvPSwapEntity {
  let dvpSwapEntity = DvPSwapEntity.load(swapId);

  if (!dvpSwapEntity) {
    dvpSwapEntity = new DvPSwapEntity(swapId);

    const dvpSwap = fetchDvPSwap(contractAddress, timestamp);
    dvpSwapEntity.contract = dvpSwap.id;
    dvpSwapEntity.factory = null; // Will be set if created via factory

    // Default values, will be updated by event handler
    const zeroAddress = Address.fromString(
      "0x0000000000000000000000000000000000000000"
    );
    dvpSwapEntity.creator = fetchAccount(zeroAddress).id;
    dvpSwapEntity.sender = fetchAccount(zeroAddress).id;
    dvpSwapEntity.receiver = fetchAccount(zeroAddress).id;
    dvpSwapEntity.tokenToSend = zeroAddress;
    dvpSwapEntity.tokenToReceive = zeroAddress;
    dvpSwapEntity.amountToSend = BigInt.zero().toBigDecimal();
    dvpSwapEntity.amountToSendExact = BigInt.zero();
    dvpSwapEntity.amountToReceive = BigInt.zero().toBigDecimal();
    dvpSwapEntity.amountToReceiveExact = BigInt.zero();
    dvpSwapEntity.timelock = BigInt.zero();
    dvpSwapEntity.hashlock = Bytes.empty();
    dvpSwapEntity.status = DvPSwapStatusType.PENDING_CREATION;
    dvpSwapEntity.createdAt = timestamp ? timestamp : BigInt.zero();
    dvpSwapEntity.maxDuration = BigInt.zero();
    dvpSwapEntity.updatedAt = timestamp ? timestamp : BigInt.zero();

    // Increment dvpSwap count
    dvpSwap.dvpSwapCount = dvpSwap.dvpSwapCount + 1;
    dvpSwap.save();

    dvpSwapEntity.save();
  }

  return dvpSwapEntity;
}
