import {
  BigInt,
  log
} from "@graphprotocol/graph-ts";
import {
  DvPSwapApproval,
  DvPSwapApprovalRevokedEvent,
  DvPSwapApprovedEvent,
  DvPSwapAutoExecutionFailedEvent,
  DvPSwapCreatedEvent,
  DvPSwapExecutedEvent,
  DvPSwapExpiredEvent,
  DvPSwapStatusChangedEvent,
  DvPSwapTransaction,
  Flow
} from "../../generated/schema";
import {
  DvPSwapApprovalRevoked,
  DvPSwapApproved,
  DvPSwapAutoExecutionFailed,
  DvPSwapCreated,
  DvPSwapExecuted,
  DvPSwapExpiredEvent as DvPSwapExpiredContractEvent,
  DvPSwapStatusChanged,
  FlowAdded,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Unpaused
} from "../../generated/templates/DvPSwap/DvPSwap";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { pausedEvent } from "../assets/events/paused";
import { roleAdminChangedEvent } from "../assets/events/roleadminchanged";
import { roleGrantedEvent } from "../assets/events/rolegranted";
import { roleRevokedEvent } from "../assets/events/rolerevoked";
import { unpausedEvent } from "../assets/events/unpaused";
import { fetchAccount } from "../fetch/account";
import { fetchDvPSwap } from "../fetch/dvpswap";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";

// Handle role-based events
export function handleRoleGranted(event: RoleGranted): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  const account = fetchAccount(event.params.account);
  
  roleGrantedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.dvpswap,
    event.params.role,
    account.id
  );
  
  // Update specific roles if needed based on role parameter
}

// Handle DvPSwap-specific events
export function handleDvPSwapCreated(event: DvPSwapCreated): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  const creator = fetchAccount(event.params.creator);
  
  log.info("DvPSwap created: id={}, creator={}", [
    event.params.dvpSwapId.toHexString(),
    creator.id.toHexString()
  ]);
  
  // Create a new swap transaction entity
  const transaction = new DvPSwapTransaction(
    event.params.dvpSwapId.toHexString()
  );
  transaction.dvpSwap = dvpSwap.id;
  transaction.creator = creator.id;
  transaction.status = "OPEN"; // Initial status is OPEN
  transaction.createdAt = event.block.timestamp;
  transaction.cutoffDate = event.params.cutoffDate;
  transaction.flowsCount = BigInt.fromI32(0);
  transaction.save();
  
  // Update DvPSwap stats
  dvpSwap.transactionsCount = dvpSwap.transactionsCount.plus(BigInt.fromI32(1));
  dvpSwap.save();
  
  // Create event entity
  const createdEvent = new DvPSwapCreatedEvent(eventId(event));
  createdEvent.eventName = EventName.DvPSwapCreated;
  createdEvent.timestamp = event.block.timestamp;
  createdEvent.emitter = dvpSwap.id;
  createdEvent.sender = sender.id;
  createdEvent.assetType = AssetType.dvpswap;
  createdEvent.transaction = event.transaction.hash;
  createdEvent.dvpSwapId = event.params.dvpSwapId;
  createdEvent.creator = creator.id;
  createdEvent.status = "OPEN";
  createdEvent.cutoffDate = event.params.cutoffDate;
  createdEvent.save();
  
  accountActivityEvent(
    sender,
    EventName.DvPSwapCreated,
    event.block.timestamp,
    AssetType.dvpswap,
    event.address
  );
}

export function handleDvPSwapStatusChanged(event: DvPSwapStatusChanged): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  log.info("DvPSwap status changed: id={}, status={}", [
    event.params.dvpSwapId.toHexString(),
    event.params.status.toString()
  ]);
  
  // Get the status as string
  let statusString = "UNKNOWN";
  const status = event.params.status;
  if (status == 0) statusString = "OPEN";
  else if (status == 1) statusString = "CLAIMED";
  else if (status == 2) statusString = "REFUNDED";
  else if (status == 3) statusString = "EXPIRED";
  else if (status == 4) statusString = "CANCELLED";
  else if (status == 5) statusString = "FAILED";
  
  // Update swap transaction status
  const transactionId = event.params.dvpSwapId.toHexString();
  const transaction = DvPSwapTransaction.load(transactionId);
  
  if (transaction) {
    const oldStatus = transaction.status;
    transaction.status = statusString;
    transaction.lastUpdatedAt = event.block.timestamp;
    transaction.save();
    
    // Update DvPSwap entity counts based on status change
    if (statusString == "CLAIMED" && oldStatus != "CLAIMED") {
      dvpSwap.executedTransactionsCount = dvpSwap.executedTransactionsCount.plus(BigInt.fromI32(1));
    } else if (statusString == "CANCELLED" && oldStatus != "CANCELLED") {
      dvpSwap.cancelledTransactionsCount = dvpSwap.cancelledTransactionsCount.plus(BigInt.fromI32(1));
    } else if (statusString == "EXPIRED" && oldStatus != "EXPIRED") {
      dvpSwap.expiredTransactionsCount = dvpSwap.expiredTransactionsCount.plus(BigInt.fromI32(1));
    }
    dvpSwap.save();
    
    // Create event entity
    const statusChangedEvent = new DvPSwapStatusChangedEvent(eventId(event));
    statusChangedEvent.eventName = EventName.DvPSwapStatusChanged;
    statusChangedEvent.timestamp = event.block.timestamp;
    statusChangedEvent.emitter = dvpSwap.id;
    statusChangedEvent.sender = sender.id;
    statusChangedEvent.assetType = AssetType.dvpswap;
    statusChangedEvent.transaction = event.transaction.hash;
    statusChangedEvent.dvpSwapId = event.params.dvpSwapId;
    statusChangedEvent.status = statusString;
    statusChangedEvent.save();
    
    accountActivityEvent(
      sender,
      EventName.DvPSwapStatusChanged,
      event.block.timestamp,
      AssetType.dvpswap,
      event.address
    );
  }
}

export function handleDvPSwapApproved(event: DvPSwapApproved): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  const party = fetchAccount(event.params.party);
  
  log.info("DvPSwap approved: id={}, party={}", [
    event.params.dvpSwapId.toHexString(),
    party.id.toHexString()
  ]);
  
  // Update swap transaction with new approval
  const transactionId = event.params.dvpSwapId.toHexString();
  const transaction = DvPSwapTransaction.load(transactionId);
  
  if (transaction) {
    // Create approval entity
    const approvalId = transactionId + "-" + party.id.toHexString();
    const approval = new DvPSwapApproval(approvalId);
    approval.dvpSwapTransaction = transaction.id;
    approval.party = party.id;
    approval.approvedAt = event.block.timestamp;
    approval.active = true;
    approval.save();
    
    // Update DvPSwap entity counts
    dvpSwap.approvedTransactionsCount = dvpSwap.approvedTransactionsCount.plus(BigInt.fromI32(1));
    dvpSwap.save();
    
    // Create event entity
    const approvedEvent = new DvPSwapApprovedEvent(eventId(event));
    approvedEvent.eventName = EventName.DvPSwapApproved;
    approvedEvent.timestamp = event.block.timestamp;
    approvedEvent.emitter = dvpSwap.id;
    approvedEvent.sender = sender.id;
    approvedEvent.assetType = AssetType.dvpswap;
    approvedEvent.transaction = event.transaction.hash;
    approvedEvent.dvpSwapId = event.params.dvpSwapId;
    approvedEvent.party = party.id;
    approvedEvent.save();
    
    accountActivityEvent(
      sender,
      EventName.DvPSwapApproved,
      event.block.timestamp,
      AssetType.dvpswap,
      event.address
    );
  }
}

export function handleDvPSwapApprovalRevoked(event: DvPSwapApprovalRevoked): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  const party = fetchAccount(event.params.party);
  
  log.info("DvPSwap approval revoked: id={}, party={}", [
    event.params.dvpSwapId.toHexString(),
    party.id.toHexString()
  ]);
  
  // Update approval entity
  const transactionId = event.params.dvpSwapId.toHexString();
  const approvalId = transactionId + "-" + party.id.toHexString();
  const approval = DvPSwapApproval.load(approvalId);
  
  if (approval) {
    approval.active = false;
    approval.revokedAt = event.block.timestamp;
    approval.save();
    
    // Update DvPSwap entity counts if needed
    dvpSwap.approvedTransactionsCount = dvpSwap.approvedTransactionsCount.minus(BigInt.fromI32(1));
    dvpSwap.save();
    
    // Create event entity
    const revokedEvent = new DvPSwapApprovalRevokedEvent(eventId(event));
    revokedEvent.eventName = EventName.DvPSwapApprovalRevoked;
    revokedEvent.timestamp = event.block.timestamp;
    revokedEvent.emitter = dvpSwap.id;
    revokedEvent.sender = sender.id;
    revokedEvent.assetType = AssetType.dvpswap;
    revokedEvent.transaction = event.transaction.hash;
    revokedEvent.dvpSwapId = event.params.dvpSwapId;
    revokedEvent.party = party.id;
    revokedEvent.save();
    
    accountActivityEvent(
      sender,
      EventName.DvPSwapApprovalRevoked,
      event.block.timestamp,
      AssetType.dvpswap,
      event.address
    );
  }
}

export function handleDvPSwapExecuted(event: DvPSwapExecuted): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  const executor = fetchAccount(event.params.executor);
  
  log.info("DvPSwap executed: id={}, executor={}", [
    event.params.dvpSwapId.toHexString(),
    executor.id.toHexString()
  ]);
  
  // Get the transaction
  const transactionId = event.params.dvpSwapId.toHexString();
  const transaction = DvPSwapTransaction.load(transactionId);
  
  if (transaction) {
    // Update transaction
    transaction.executor = executor.id;
    transaction.executedAt = event.block.timestamp;
    transaction.save();
    
    // Create event entity
    const executedEvent = new DvPSwapExecutedEvent(eventId(event));
    executedEvent.eventName = EventName.DvPSwapExecuted;
    executedEvent.timestamp = event.block.timestamp;
    executedEvent.emitter = dvpSwap.id;
    executedEvent.sender = sender.id;
    executedEvent.assetType = AssetType.dvpswap;
    executedEvent.transaction = event.transaction.hash;
    executedEvent.dvpSwapId = event.params.dvpSwapId;
    executedEvent.executor = executor.id;
    executedEvent.save();
    
    accountActivityEvent(
      sender,
      EventName.DvPSwapExecuted,
      event.block.timestamp,
      AssetType.dvpswap,
      event.address
    );
  }
}

export function handleDvPSwapExpired(event: DvPSwapExpiredContractEvent): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  log.info("DvPSwap expired: id={}, timestamp={}", [
    event.params.dvpSwapId.toHexString(),
    event.params.timestamp.toString()
  ]);
  
  // Get the transaction
  const transactionId = event.params.dvpSwapId.toHexString();
  const transaction = DvPSwapTransaction.load(transactionId);
  
  if (transaction) {
    // Update transaction
    transaction.expiredAt = event.block.timestamp;
    transaction.save();
    
    // Create event entity
    const expiredEvent = new DvPSwapExpiredEvent(eventId(event));
    expiredEvent.eventName = EventName.DvPSwapExpired;
    expiredEvent.timestamp = event.block.timestamp;
    expiredEvent.emitter = dvpSwap.id;
    expiredEvent.sender = sender.id;
    expiredEvent.assetType = AssetType.dvpswap;
    expiredEvent.transaction = event.transaction.hash;
    expiredEvent.dvpSwapId = event.params.dvpSwapId;
    expiredEvent.save();
    
    accountActivityEvent(
      sender,
      EventName.DvPSwapExpired,
      event.block.timestamp,
      AssetType.dvpswap,
      event.address
    );
  }
}

export function handleFlowAdded(event: FlowAdded): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  const from = fetchAccount(event.params.from);
  const to = fetchAccount(event.params.to);
  
  log.info("Flow added: id={}, from={}, to={}, token={}, amount={}", [
    event.params.dvpSwapId.toHexString(),
    from.id.toHexString(),
    to.id.toHexString(),
    event.params.token.toHexString(),
    event.params.amount.toString()
  ]);
  
  // Get the transaction
  const transactionId = event.params.dvpSwapId.toHexString();
  const transaction = DvPSwapTransaction.load(transactionId);
  
  if (transaction) {
    // Increment flow count
    const flowCount = transaction.flowsCount;
    transaction.flowsCount = flowCount.plus(BigInt.fromI32(1));
    transaction.save();
    
    // Create new flow entity
    const flowId = transactionId + "-flow-" + flowCount.toString();
    const flow = new Flow(flowId);
    flow.dvpSwapTransaction = transaction.id;
    flow.flowId = flowCount;
    flow.from = from.id;
    flow.to = to.id;
    flow.token = event.params.token;
    flow.amount = event.params.amount;
    flow.createdAt = event.block.timestamp;
    flow.save();
    
    accountActivityEvent(
      sender,
      EventName.FlowAdded,
      event.block.timestamp,
      AssetType.dvpswap,
      event.address
    );
  }
}

export function handleDvPSwapAutoExecutionFailed(event: DvPSwapAutoExecutionFailed): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  const executor = fetchAccount(event.params.executor);
  
  log.info("DvPSwap auto-execution failed: id={}, executor={}, reason={}", [
    event.params.dvpSwapId.toHexString(),
    executor.id.toHexString(),
    event.params.reason
  ]);
  
  // Create event entity
  const failedEvent = new DvPSwapAutoExecutionFailedEvent(eventId(event));
  failedEvent.eventName = EventName.DvPSwapAutoExecutionFailed;
  failedEvent.timestamp = event.block.timestamp;
  failedEvent.emitter = dvpSwap.id;
  failedEvent.sender = sender.id;
  failedEvent.assetType = AssetType.dvpswap;
  failedEvent.transaction = event.transaction.hash;
  failedEvent.dvpSwapId = event.params.dvpSwapId;
  failedEvent.executor = executor.id;
  failedEvent.reason = event.params.reason;
  failedEvent.save();
  
  accountActivityEvent(
    sender,
    EventName.DvPSwapAutoExecutionFailed,
    event.block.timestamp,
    AssetType.dvpswap,
    event.address
  );
}

export function handlePaused(event: Paused): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  // Update DvPSwap entity
  dvpSwap.paused = true;
  dvpSwap.save();
  
  pausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.dvpswap
  );
}

export function handleUnpaused(event: Unpaused): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  // Update DvPSwap entity
  dvpSwap.paused = false;
  dvpSwap.save();
  
  unpausedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.dvpswap
  );
}

export function handleRoleRevoked(event: RoleRevoked): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  const account = fetchAccount(event.params.account);
  
  roleRevokedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.dvpswap,
    event.params.role,
    account.id
  );
  
  // Update specific roles if revoked
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  const dvpSwap = fetchDvPSwap(event.address);
  const sender = fetchAccount(event.transaction.from);
  
  roleAdminChangedEvent(
    eventId(event),
    event.block.timestamp,
    event.address,
    sender.id,
    AssetType.dvpswap,
    event.params.role,
    event.params.previousAdminRole,
    event.params.newAdminRole
  );
} 