import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, MintEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function mintEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  to: Bytes,
  value: BigInt,
  decimals: number
): MintEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.Mint);
  const mintEvent = new MintEvent(id);
  mintEvent.eventName = EventName.Mint;
  mintEvent.timestamp = timestamp;
  mintEvent.emitter = emitter;
  mintEvent.sender = sender.id;
  mintEvent.to = to;
  mintEvent.value = toDecimals(value, decimals);
  mintEvent.valueExact = value;
  mintEvent.save();
  return mintEvent;
}
