import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { PausedEvent } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function pausedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  assetType: string
): PausedEvent {
  const event = new PausedEvent(id);
  event.eventName = EventName.Paused;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.assetType = assetType;
  event.save();
  return event;
}
