import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AccountActivityEvent } from "../../../generated/schema";

export function accountActivityEvent(
  id: Bytes,
  account: Bytes,
  eventName: string,
  timestamp: BigInt,
  assetType: string | null = null,
  asset: Bytes | null = null
): AccountActivityEvent {
  const event = new AccountActivityEvent(id);
  event.eventName = eventName;
  event.timestamp = timestamp;
  event.account = account;
  if (asset) {
    event.asset = asset;
  }
  if (assetType) {
    event.assetType = assetType;
  }
  event.save();
  return event;
}
