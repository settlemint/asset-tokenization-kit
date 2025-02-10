import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AccountActivityEvent } from "../../../generated/schema";

export function accountActivityEvent(
  id: Bytes,
  account: Bytes,
  eventName: string,
  timestamp: BigInt,
  asset: Bytes | null
): AccountActivityEvent {
  const event = new AccountActivityEvent(id);
  event.eventName = eventName;
  event.timestamp = timestamp;
  event.account = account;
  if (asset) {
    event.asset = asset;
  }
  event.save();
  return event;
}
