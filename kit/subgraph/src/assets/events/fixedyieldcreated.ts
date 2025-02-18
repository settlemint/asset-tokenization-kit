import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { FixedYieldCreatedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function fixedYieldCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  fixedYield: Bytes
): FixedYieldCreatedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.FixedYieldCreated);
  const event = new FixedYieldCreatedEvent(id);
  event.eventName = EventName.FixedYieldCreated;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.fixedYield = fixedYield;
  event.save();
  return event;
}
