import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, BurnEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function burnEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  from: Bytes,
  value: BigInt,
  decimals: number
): BurnEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.Burn);
  const burnEvent = new BurnEvent(id);
  burnEvent.eventName = EventName.Burn;
  burnEvent.timestamp = timestamp;
  burnEvent.emitter = emitter;
  burnEvent.sender = sender.id;
  burnEvent.from = from;
  burnEvent.value = toDecimals(value, decimals);
  burnEvent.valueExact = value;
  burnEvent.save();
  return burnEvent;
}
