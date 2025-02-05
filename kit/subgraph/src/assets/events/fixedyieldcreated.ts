import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { FixedYieldCreatedEvent } from '../../../generated/schema';

export function fixedYieldCreatedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  fixedYield: Bytes
): FixedYieldCreatedEvent {
  const event = new FixedYieldCreatedEvent(id);
  event.eventName = 'Fixed Yield Created';
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.fixedYield = fixedYield;
  event.save();
  return event;
}
