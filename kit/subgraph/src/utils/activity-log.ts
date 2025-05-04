import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  ActivityLogEntry,
  ActivityLogEntryValue,
} from "../../generated/schema";
import { fetchAccount } from "./account";

export class EventType {
  static Transfer: string = "Transfer";
  static Mint: string = "Mint";
  static Burn: string = "Burn";
  static RoleGranted: string = "RoleGranted";
  static RoleRevoked: string = "RoleRevoked";
  static RoleAdminChanged: string = "RoleAdminChanged";
  static Approval: string = "Approval";
  static Pause: string = "Pause";
  static Unpause: string = "Unpause";
  static Clawback: string = "Clawback";
  static TokensFrozen: string = "TokensFrozen";
  static UserBlocked: string = "UserBlocked";
  static UserUnblocked: string = "UserUnblocked";
  static UserAllowed: string = "UserAllowed";
  static UserDisallowed: string = "UserDisallowed";
  static TokenWithdrawn: string = "TokenWithdrawn";
  static CollateralUpdated: string = "CollateralUpdated";
  static Matured: string = "Matured";
  static Redeemed: string = "Redeemed";
  static UnderlyingAssetTopUp: string = "UnderlyingAssetTopUp";
  static UnderlyingAssetWithdrawn: string = "UnderlyingAssetWithdrawn";
  static ManagementFeeCollected: string = "ManagementFeeCollected";
  static PerformanceFeeCollected: string = "PerformanceFeeCollected";
  static YieldClaimed: string = "YieldClaimed";
  static AssetCreated: string = "AssetCreated";
  static FixedYieldCreated: string = "FixedYieldCreated";
  static XvPSettlementApproved: string = "XvPSettlementApproved";
  static XvPSettlementApprovalRevoked: string = "XvPSettlementApprovalRevoked";
  static XvPSettlementClaimed: string = "XvPSettlementClaimed";
  static XvPSettlementExecuted: string = "XvPSettlementExecuted";
  static XvPSettlementCancelled: string = "XvPSettlementCancelled";
  static Claimed: string = "Claimed";
  static Distribution: string = "Distribution";
  static BatchDistribution: string = "BatchDistribution";
  static MerkleRootUpdated: string = "MerkleRootUpdated";
}

function activityLogEntryId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32());
}

function activityLogEntryValueId(event: ethereum.Event, name: string): Bytes {
  return event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .concat(Bytes.fromUTF8(name));
}

export function createActivityLogEntry(
  event: ethereum.Event,
  eventType: string,
  sender: Address,
  involved: Address[]
): ActivityLogEntry {
  const entry = new ActivityLogEntry(activityLogEntryId(event));
  entry.eventName = eventType;
  entry.blockNumber = event.block.number;
  entry.blockTimestamp = event.block.timestamp;
  entry.txIndex = event.transaction.index;
  entry.transactionHash = event.transaction.hash;
  entry.emitter = fetchAccount(event.address).id;
  entry.sender = fetchAccount(sender).id;

  const involvedAccounts = [
    fetchAccount(event.transaction.from).id,
    fetchAccount(event.address).id,
  ];
  for (let i = 0; i < involved.length; i++) {
    const account = fetchAccount(involved[i]);
    involvedAccounts.push(account.id);
  }
  entry.involved = involvedAccounts;

  entry.save();

  for (let i = 0; i < event.parameters.length; i++) {
    const param = event.parameters[i];
    const name = param.name;

    let value = "";
    if (param.value.kind == ethereum.ValueKind.ADDRESS) {
      value = param.value.toAddress().toHexString();
    } else if (param.value.kind == ethereum.ValueKind.BOOL) {
      value = param.value.toBoolean().toString();
    } else if (param.value.kind == ethereum.ValueKind.BYTES) {
      value = param.value.toBytes().toString();
    } else if (param.value.kind == ethereum.ValueKind.FIXED_BYTES) {
      value = param.value.toBytes().toHexString();
    } else if (param.value.kind == ethereum.ValueKind.INT) {
      value = param.value.toBigInt().toString();
    } else if (param.value.kind == ethereum.ValueKind.UINT) {
      value = param.value.toBigInt().toString();
    } else if (param.value.kind == ethereum.ValueKind.STRING) {
      value = param.value.toString();
    } else {
      value = param.value.toString();
    }

    const entryValue = new ActivityLogEntryValue(
      activityLogEntryValueId(event, name)
    );
    entryValue.name = name;
    entryValue.value = value;
    entryValue.entry = entry.id;
    entryValue.save();
  }

  return entry;
}
