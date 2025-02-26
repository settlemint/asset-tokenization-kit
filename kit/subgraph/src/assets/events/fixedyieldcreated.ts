import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { FixedYieldCreatedEvent } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function fixedYieldCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  fixedYield: Bytes,
): FixedYieldCreatedEvent {
  const event = new FixedYieldCreatedEvent(id);
  event.eventName = EventName.FixedYieldCreated;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.fixedYield = fixedYield;
  event.save();
  return event;
}
