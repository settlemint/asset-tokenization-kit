import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { UnpausedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function unpausedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Bytes): UnpausedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.Unpaused);
  const event = new UnpausedEvent(id);
  event.eventName = EventName.Unpaused;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();
  return event;
}
