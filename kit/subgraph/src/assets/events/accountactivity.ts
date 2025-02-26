import { BigInt, Bytes, ByteArray } from "@graphprotocol/graph-ts";
import { Account, AccountActivityEvent } from "../../../generated/schema";

export function accountActivityEvent(
  account: Account,
  eventName: string,
  timestamp: BigInt,
  assetType: string | null = null,
  asset: Bytes | null = null,
): AccountActivityEvent {
  const eventId = Bytes.fromByteArray(
    ByteArray.fromUTF8(
      `${account.id.toHexString()}-${eventName}-${timestamp.toString()}`,
    ),
  );
  const event = new AccountActivityEvent(eventId);
  event.eventName = eventName;
  event.timestamp = timestamp;
  event.account = account.id;
  if (asset) {
    event.asset = asset;
  }
  if (assetType) {
    event.assetType = assetType;
  }
  event.save();

  account.activityEventsCount = account.activityEventsCount + 1;
  account.lastActivity = timestamp;
  account.save();

  return event;
}
