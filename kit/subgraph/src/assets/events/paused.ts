import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { PausedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function pausedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Bytes): PausedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.Paused);
  const event = new PausedEvent(id);
  event.eventName = EventName.Paused;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();
  return event;
}
