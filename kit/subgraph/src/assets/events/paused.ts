import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { PausedEvent } from '../../../generated/schema';

export function pausedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Bytes): PausedEvent {
  const event = new PausedEvent(id);
  event.eventName = 'Paused';
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();
  return event;
}
