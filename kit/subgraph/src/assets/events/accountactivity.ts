import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Account, AccountActivityEvent } from "../../../generated/schema";

export function accountActivityEvent(
  id: Bytes,
  account: Account,
  eventName: string,
  timestamp: BigInt,
  assetType: string | null = null,
  asset: Bytes | null = null
): AccountActivityEvent {
  const event = new AccountActivityEvent(id);
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

  account.lastActivity = timestamp;
  account.save();

  return event;
}
