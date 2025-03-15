import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { UserAllowedEvent } from "../../../generated/schema";

export function userAllowedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  assetType: string,
  user: Bytes
): UserAllowedEvent {
  const event = new UserAllowedEvent(id);
  event.eventName = "User Allowed";
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = assetType;
  event.user = user;
  event.save();
  return event;
}
