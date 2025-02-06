import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { BondMaturedEvent } from '../../../generated/schema';

export function bondMaturedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Bytes): BondMaturedEvent {
  const event = new BondMaturedEvent(id);
  event.eventName = 'Bond Matured';
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();
  return event;
}
