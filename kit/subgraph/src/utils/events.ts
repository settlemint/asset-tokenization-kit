import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account, HandledEvent } from "../../generated/schema";

export function eventId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32());
}

export function createEvent(
  event: ethereum.Event,
  eventName: string,
  sender: Account,
  involved: Account[],
  details: string
): HandledEvent {
  const involvedIds: Bytes[] = [];
  for (let i = 0; i < involved.length; i++) {
    involvedIds.push(involved[i].id);
  }

  const handledEvent = new HandledEvent(eventId(event));
  handledEvent.eventName = eventName;
  handledEvent.timestamp = event.block.timestamp;
  handledEvent.emitter = event.address;
  handledEvent.sender = sender.id;
  handledEvent.involved = involvedIds;
  handledEvent.details = details;
  handledEvent.save();
  return handledEvent;
}
