import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { UnpausedEvent } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function unpausedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
): UnpausedEvent {
  const event = new UnpausedEvent(id);
  event.eventName = EventName.Unpaused;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();
  return event;
}
