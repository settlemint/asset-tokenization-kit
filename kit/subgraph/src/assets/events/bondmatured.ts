import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { BondMaturedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function bondMaturedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Bytes): BondMaturedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.BondMatured);
  const event = new BondMaturedEvent(id);
  event.eventName = EventName.BondMatured;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.save();
  return event;
}
