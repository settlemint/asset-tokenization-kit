import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, PausedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function pausedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Account): PausedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.Paused);
  const event = new PausedEvent(id);
  event.eventName = EventName.Paused;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.save();
  return event;
}
