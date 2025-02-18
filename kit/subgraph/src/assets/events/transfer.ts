import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, TransferEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function transferEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  from: Bytes,
  to: Bytes,
  value: BigInt,
  decimals: number
): TransferEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.Transfer);
  const transferEvent = new TransferEvent(id);
  transferEvent.eventName = EventName.Transfer;
  transferEvent.timestamp = timestamp;
  transferEvent.emitter = emitter;
  transferEvent.sender = sender.id;
  transferEvent.from = from;
  transferEvent.to = to;
  transferEvent.value = toDecimals(value, decimals);
  transferEvent.valueExact = value;
  transferEvent.save();
  return transferEvent;
}
