import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, UnpausedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function unpausedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Account): UnpausedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.Unpaused);
  const event = new UnpausedEvent(id);
  event.eventName = EventName.Unpaused;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.save();
  return event;
}
