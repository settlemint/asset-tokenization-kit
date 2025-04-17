import { log } from "@graphprotocol/graph-ts";
import { SwapCreatedEvent } from "../../generated/schema";
import { SwapCreated } from "../../generated/templates/DvPSwap/DvPSwap";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { fetchAccount } from "../fetch/account";
import { fetchDvPSwap, fetchSwap } from "../fetch/dvpswap";
import { toDecimals } from "../utils/decimals";
import { AssetType, EventName, SwapStatusType } from "../utils/enums";
import { eventId } from "../utils/events";
import { newDvPSwapStatsData } from "./stats";

// Handler for SwapCreated events
export function handleSwapCreated(event: SwapCreated): void {
  const sender = fetchAccount(event.transaction.from);
  const receiver = fetchAccount(event.params.receiver);
  const dvpSwap = fetchDvPSwap(event.address, event.block.timestamp);
  
  // Fetch token details
  const tokenToSend = event.params.tokenToSend;
  const tokenToReceive = event.params.tokenToReceive;
  
  // Fetch or create swap entity
  const swap = fetchSwap(event.params.swapId, event.address, event.block.timestamp);
  
  // Update swap details
  swap.creator = sender.id;
  swap.sender = sender.id;
  swap.receiver = receiver.id;
  swap.tokenToSend = tokenToSend;
  swap.tokenToReceive = tokenToReceive;
  swap.amountToSendExact = event.params.amountToSend;
  swap.amountToSend = toDecimals(event.params.amountToSend, 18); // Assuming ERC20 has 18 decimals
  swap.amountToReceiveExact = event.params.amountToReceive;
  swap.amountToReceive = toDecimals(event.params.amountToReceive, 18); // Assuming ERC20 has 18 decimals
  swap.timelock = event.params.timelock;
  swap.hashlock = event.params.hashlock;
  swap.status = SwapStatusType.Open;
  swap.updatedAt = event.block.timestamp;
  
  // Create event entity
  const swapCreatedEvent = new SwapCreatedEvent(eventId(event));
  swapCreatedEvent.eventName = EventName.SwapCreated;
  swapCreatedEvent.timestamp = event.block.timestamp;
  swapCreatedEvent.contract = dvpSwap.id;
  swapCreatedEvent.sender = sender.id;
  swapCreatedEvent.swap = swap.id;
  swapCreatedEvent.receiver = receiver.id;
  swapCreatedEvent.tokenToSend = tokenToSend;
  swapCreatedEvent.tokenToReceive = tokenToReceive;
  swapCreatedEvent.amountToSendExact = event.params.amountToSend;
  swapCreatedEvent.amountToSend = toDecimals(event.params.amountToSend, 18);
  swapCreatedEvent.amountToReceiveExact = event.params.amountToReceive;
  swapCreatedEvent.amountToReceive = toDecimals(event.params.amountToReceive, 18);
  swapCreatedEvent.timelock = event.params.timelock;
  swapCreatedEvent.hashlock = event.params.hashlock;
  
  // Track TVL
  dvpSwap.totalValueLockedExact = dvpSwap.totalValueLockedExact.plus(event.params.amountToSend);
  dvpSwap.totalValueLocked = toDecimals(dvpSwap.totalValueLockedExact, 18);
  
  // Save entities
  swap.save();
  swapCreatedEvent.save();
  dvpSwap.save();
  
  // Create stats
  const stats = newDvPSwapStatsData(dvpSwap.id);
  stats.swapsCreated = 1;
  stats.valueLockedExact = event.params.amountToSend;
  stats.valueLocked = toDecimals(event.params.amountToSend, 18);
  stats.save();
  
  // Generate activity events
  accountActivityEvent(
    sender, 
    EventName.SwapCreated, 
    event.block.timestamp, 
    AssetType.dvpswap, 
    dvpSwap.id
  );
  
  accountActivityEvent(
    receiver, 
    EventName.SwapCreated, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  log.info(
    "DvPSwap - Swap created: swapId={}, sender={}, receiver={}, tokenToSend={}, tokenToReceive={}, amountToSend={}, amountToReceive={}", 
    [
      event.params.swapId.toHexString(),
      sender.id.toHexString(),
      receiver.id.toHexString(),
      tokenToSend.toHexString(),
      tokenToReceive.toHexString(),
      event.params.amountToSend.toString(),
      event.params.amountToReceive.toString()
    ]
  );
} 