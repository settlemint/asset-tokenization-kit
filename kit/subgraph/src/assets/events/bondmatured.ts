import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, BondMaturedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function bondMaturedEvent(id: Bytes, timestamp: BigInt, emitter: Bytes, sender: Account): BondMaturedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.BondMatured);
  const event = new BondMaturedEvent(id);
  event.eventName = EventName.BondMatured;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.save();
  return event;
}
