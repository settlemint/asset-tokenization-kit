import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { XvPSettlementCreatedEvent } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function xvpSettlementCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes
): XvPSettlementCreatedEvent {
  const event = new XvPSettlementCreatedEvent(id);
  event.eventName = EventName.XvPSettlementCreated;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();

  return event;
}
