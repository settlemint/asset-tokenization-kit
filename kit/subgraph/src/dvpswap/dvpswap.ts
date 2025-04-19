import { log } from "@graphprotocol/graph-ts";
import { DvPSwapClaimedEvent, DvPSwapCreatedEvent, DvPSwapRefundedEvent, DvPSwapStatusChangedEvent, TokensLockedEvent } from "../../generated/schema";
import { DvPSwapClaimed, DvPSwapCreated, DvPSwapRefunded, DvPSwapStatusChanged, TokensLocked } from "../../generated/templates/DvPSwap/DvPSwap";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { fetchAccount } from "../fetch/account";
import { fetchDvPSwap, fetchDvPSwapEntity } from "../fetch/dvpswap";
import { toDecimals } from "../utils/decimals";
import { AssetType, DvPSwapStatusType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { newDvPSwapStatsData } from "./stats";

// Handler for DvPSwapCreated events
export function handleDvPSwapCreated(event: DvPSwapCreated): void {
  const sender = fetchAccount(event.transaction.from);
  const receiver = fetchAccount(event.params.receiver);
  const dvpSwap = fetchDvPSwap(event.address, event.block.timestamp);
  
  // Fetch token details
  const tokenToSend = event.params.tokenToSend;
  const tokenToReceive = event.params.tokenToReceive;
  
  // Fetch or create swap entity
  const dvpSwapEntity = fetchDvPSwapEntity(event.params.dvpSwapId, event.address, event.block.timestamp);
  
  // Update swap details
  dvpSwapEntity.creator = sender.id;
  dvpSwapEntity.sender = sender.id;
  dvpSwapEntity.receiver = receiver.id;
  dvpSwapEntity.tokenToSend = tokenToSend;
  dvpSwapEntity.tokenToReceive = tokenToReceive;
  dvpSwapEntity.amountToSendExact = event.params.amountToSend;
  dvpSwapEntity.amountToSend = toDecimals(event.params.amountToSend, 18); // Assuming ERC20 has 18 decimals
  dvpSwapEntity.amountToReceiveExact = event.params.amountToReceive;
  dvpSwapEntity.amountToReceive = toDecimals(event.params.amountToReceive, 18); // Assuming ERC20 has 18 decimals
  dvpSwapEntity.timelock = event.params.timelock;
  dvpSwapEntity.hashlock = event.params.hashlock;
  dvpSwapEntity.status = DvPSwapStatusType.OPEN;
  dvpSwapEntity.updatedAt = event.block.timestamp;
  
  // Create event entity
  const dvpSwapCreatedEvent = new DvPSwapCreatedEvent(eventId(event));
  dvpSwapCreatedEvent.eventName = EventName.DvPSwapCreated;
  dvpSwapCreatedEvent.timestamp = event.block.timestamp;
  dvpSwapCreatedEvent.contract = dvpSwap.id;
  dvpSwapCreatedEvent.sender = sender.id;
  dvpSwapCreatedEvent.swap = dvpSwapEntity.id;
  dvpSwapCreatedEvent.receiver = receiver.id;
  dvpSwapCreatedEvent.tokenToSend = tokenToSend;
  dvpSwapCreatedEvent.tokenToReceive = tokenToReceive;
  dvpSwapCreatedEvent.amountToSendExact = event.params.amountToSend;
  dvpSwapCreatedEvent.amountToSend = toDecimals(event.params.amountToSend, 18);
  dvpSwapCreatedEvent.amountToReceiveExact = event.params.amountToReceive;
  dvpSwapCreatedEvent.amountToReceive = toDecimals(event.params.amountToReceive, 18);
  dvpSwapCreatedEvent.timelock = event.params.timelock;
  dvpSwapCreatedEvent.hashlock = event.params.hashlock;
  
  // Track TVL
  dvpSwap.totalValueLockedExact = dvpSwap.totalValueLockedExact.plus(event.params.amountToSend);
  dvpSwap.totalValueLocked = toDecimals(dvpSwap.totalValueLockedExact, 18);
  
  // Save entities
  dvpSwapEntity.save();
  dvpSwapCreatedEvent.save();
  dvpSwap.save();
  
  // Create stats
  const stats = newDvPSwapStatsData(dvpSwap.id);
  stats.dvpSwapsCreated = 1;
  stats.valueLockedExact = event.params.amountToSend;
  stats.valueLocked = toDecimals(event.params.amountToSend, 18);
  stats.save();
  
  // Generate activity events
  accountActivityEvent(
    sender, 
    EventName.DvPSwapCreated, 
    event.block.timestamp, 
    AssetType.dvpswap, 
    dvpSwap.id
  );
  
  accountActivityEvent(
    receiver, 
    EventName.DvPSwapCreated, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  log.info(
    "DvPSwap - DvPSwap created: dvpSwapId={}, sender={}, receiver={}, tokenToSend={}, tokenToReceive={}, amountToSend={}, amountToReceive={}", 
    [
      event.params.dvpSwapId.toHexString(),
      sender.id.toHexString(),
      receiver.id.toHexString(),
      tokenToSend.toHexString(),
      tokenToReceive.toHexString(),
      event.params.amountToSend.toString(),
      event.params.amountToReceive.toString()
    ]
  );
}

// Handler for DvPSwapStatusChanged events
export function handleDvPSwapStatusChanged(event: DvPSwapStatusChanged): void {
  const sender = fetchAccount(event.transaction.from);
  const dvpSwap = fetchDvPSwap(event.address, event.block.timestamp);
  const dvpSwapEntity = fetchDvPSwapEntity(event.params.dvpSwapId, event.address, event.block.timestamp);
  
  // Update swap status
  let statusString = DvPSwapStatusType.PENDING_CREATION;
  
  // Map status enum value to string
  if (event.params.status == 0) {
    statusString = DvPSwapStatusType.PENDING_CREATION;
  } else if (event.params.status == 1) {
    statusString = DvPSwapStatusType.OPEN;
  } else if (event.params.status == 2) {
    statusString = DvPSwapStatusType.CLAIMED;
  } else if (event.params.status == 3) {
    statusString = DvPSwapStatusType.REFUNDED;
  } else if (event.params.status == 4) {
    statusString = DvPSwapStatusType.EXPIRED;
  } else if (event.params.status == 5) {
    statusString = DvPSwapStatusType.CANCELLED;
  } else if (event.params.status == 6) {
    statusString = DvPSwapStatusType.FAILED;
  } else if (event.params.status == 7) {
    statusString = DvPSwapStatusType.INVALID;
  } else if (event.params.status == 8) {
    statusString = DvPSwapStatusType.AWAITING_APPROVAL;
  } else if (event.params.status == 9) {
    statusString = DvPSwapStatusType.AWAITING_CLAIM_SECRET;
  }
  
  dvpSwapEntity.status = statusString;
  dvpSwapEntity.updatedAt = event.block.timestamp;
  
  // Create event entity
  const statusChangedEvent = new DvPSwapStatusChangedEvent(eventId(event));
  statusChangedEvent.eventName = EventName.DvPSwapStatusChanged;
  statusChangedEvent.timestamp = event.block.timestamp;
  statusChangedEvent.contract = dvpSwap.id;
  statusChangedEvent.sender = sender.id;
  statusChangedEvent.swap = dvpSwapEntity.id;
  statusChangedEvent.status = statusString;
  
  // Save entities
  dvpSwapEntity.save();
  statusChangedEvent.save();
  
  // Generate activity event
  accountActivityEvent(
    sender, 
    EventName.DvPSwapStatusChanged, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  log.info(
    "DvPSwap - Status changed: dvpSwapId={}, status={}", 
    [
      event.params.dvpSwapId.toHexString(),
      statusString
    ]
  );
}

// Handler for DvPSwapClaimed events
export function handleDvPSwapClaimed(event: DvPSwapClaimed): void {
  const sender = fetchAccount(event.transaction.from);
  const receiver = fetchAccount(event.params.receiver);
  const dvpSwap = fetchDvPSwap(event.address, event.block.timestamp);
  const dvpSwapEntity = fetchDvPSwapEntity(event.params.dvpSwapId, event.address, event.block.timestamp);
  
  // Update swap status
  dvpSwapEntity.status = DvPSwapStatusType.CLAIMED;
  dvpSwapEntity.updatedAt = event.block.timestamp;
  
  // Create event entity
  const claimedEvent = new DvPSwapClaimedEvent(eventId(event));
  claimedEvent.eventName = EventName.DvPSwapClaimed;
  claimedEvent.timestamp = event.block.timestamp;
  claimedEvent.contract = dvpSwap.id;
  claimedEvent.sender = sender.id;
  claimedEvent.swap = dvpSwapEntity.id;
  claimedEvent.receiver = receiver.id;
  claimedEvent.secret = event.params.secret;
  
  // Update stats
  const stats = newDvPSwapStatsData(dvpSwap.id);
  stats.dvpSwapsClaimed = 1;
  stats.valueUnlockedExact = dvpSwapEntity.amountToSendExact;
  stats.valueUnlocked = dvpSwapEntity.amountToSend;
  
  // Update TVL
  dvpSwap.totalValueLockedExact = dvpSwap.totalValueLockedExact.minus(dvpSwapEntity.amountToSendExact);
  dvpSwap.totalValueLocked = toDecimals(dvpSwap.totalValueLockedExact, 18);
  
  // Save entities
  dvpSwapEntity.save();
  claimedEvent.save();
  dvpSwap.save();
  stats.save();
  
  // Generate activity events
  accountActivityEvent(
    sender, 
    EventName.DvPSwapClaimed, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  accountActivityEvent(
    receiver, 
    EventName.DvPSwapClaimed, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  log.info(
    "DvPSwap - DvPSwap claimed: dvpSwapId={}, receiver={}, secret={}", 
    [
      event.params.dvpSwapId.toHexString(),
      receiver.id.toHexString(),
      event.params.secret.toHexString()
    ]
  );
}

// Handler for DvPSwapRefunded events
export function handleDvPSwapRefunded(event: DvPSwapRefunded): void {
  const sender = fetchAccount(event.transaction.from);
  const refundedTo = fetchAccount(event.params.sender);
  const dvpSwap = fetchDvPSwap(event.address, event.block.timestamp);
  const dvpSwapEntity = fetchDvPSwapEntity(event.params.dvpSwapId, event.address, event.block.timestamp);
  
  // Update swap status
  dvpSwapEntity.status = DvPSwapStatusType.REFUNDED;
  dvpSwapEntity.updatedAt = event.block.timestamp;
  
  // Create event entity
  const refundedEvent = new DvPSwapRefundedEvent(eventId(event));
  refundedEvent.eventName = EventName.DvPSwapRefunded;
  refundedEvent.timestamp = event.block.timestamp;
  refundedEvent.contract = dvpSwap.id;
  refundedEvent.sender = sender.id;
  refundedEvent.swap = dvpSwapEntity.id;
  refundedEvent.refundedTo = refundedTo.id;
  
  // Update stats
  const stats = newDvPSwapStatsData(dvpSwap.id);
  stats.dvpSwapsRefunded = 1;
  stats.valueUnlockedExact = dvpSwapEntity.amountToSendExact;
  stats.valueUnlocked = dvpSwapEntity.amountToSend;
  
  // Update TVL
  dvpSwap.totalValueLockedExact = dvpSwap.totalValueLockedExact.minus(dvpSwapEntity.amountToSendExact);
  dvpSwap.totalValueLocked = toDecimals(dvpSwap.totalValueLockedExact, 18);
  
  // Save entities
  dvpSwapEntity.save();
  refundedEvent.save();
  dvpSwap.save();
  stats.save();
  
  // Generate activity events
  accountActivityEvent(
    sender, 
    EventName.DvPSwapRefunded, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  accountActivityEvent(
    refundedTo, 
    EventName.DvPSwapRefunded, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  log.info(
    "DvPSwap - DvPSwap refunded: dvpSwapId={}, refundedTo={}", 
    [
      event.params.dvpSwapId.toHexString(),
      refundedTo.id.toHexString()
    ]
  );
}

// Handler for TokensLocked events
export function handleTokensLocked(event: TokensLocked): void {
  const sender = fetchAccount(event.transaction.from);
  const dvpSwap = fetchDvPSwap(event.address, event.block.timestamp);
  const dvpSwapEntity = fetchDvPSwapEntity(event.params.dvpSwapId, event.address, event.block.timestamp);
  
  // Create event entity
  const tokensLockedEvent = new TokensLockedEvent(eventId(event));
  tokensLockedEvent.eventName = EventName.TokensLocked;
  tokensLockedEvent.timestamp = event.block.timestamp;
  tokensLockedEvent.contract = dvpSwap.id;
  tokensLockedEvent.sender = sender.id;
  tokensLockedEvent.swap = dvpSwapEntity.id;
  tokensLockedEvent.tokenAddress = event.params.tokenAddress;
  tokensLockedEvent.amountExact = event.params.amount;
  tokensLockedEvent.amount = toDecimals(event.params.amount, 18); // Assuming 18 decimals
  tokensLockedEvent.lockTimestamp = event.params.timestamp;
  
  // Save entity
  tokensLockedEvent.save();
  
  // Generate activity event
  accountActivityEvent(
    sender, 
    EventName.TokensLocked, 
    event.block.timestamp, 
    AssetType.dvpswap,
    dvpSwap.id
  );
  
  log.info(
    "DvPSwap - Tokens locked: dvpSwapId={}, tokenAddress={}, amount={}", 
    [
      event.params.dvpSwapId.toHexString(),
      event.params.tokenAddress.toHexString(),
      event.params.amount.toString()
    ]
  );
} 