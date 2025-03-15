import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { UserDisallowedEvent } from "../../../generated/schema";

export function userDisallowedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  assetType: string,
  user: Bytes
): UserDisallowedEvent {
  const event = new UserDisallowedEvent(id);
  event.eventName = "User Disallowed";
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = assetType;
  event.user = user;
  event.save();
  return event;
}
