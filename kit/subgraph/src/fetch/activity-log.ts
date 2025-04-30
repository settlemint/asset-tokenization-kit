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
  involved: Address[]
): ActivityLogEntry {
  const entry = new ActivityLogEntry(activityLogEntryId(event));
  entry.eventName = eventType;
  entry.blockNumber = event.block.number;
  entry.blockTimestamp = event.block.timestamp;
  entry.txIndex = event.transaction.index;
  entry.transactionHash = event.transaction.hash;

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
