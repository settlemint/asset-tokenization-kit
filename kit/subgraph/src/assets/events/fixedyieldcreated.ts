import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, FixedYieldCreatedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function fixedYieldCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  fixedYield: Bytes
): FixedYieldCreatedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.FixedYieldCreated);
  const event = new FixedYieldCreatedEvent(id);
  event.eventName = EventName.FixedYieldCreated;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.fixedYield = fixedYield;
  event.save();
  return event;
}
