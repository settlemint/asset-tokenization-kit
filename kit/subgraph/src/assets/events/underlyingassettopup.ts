import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, UnderlyingAssetTopUpEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function underlyingAssetTopUpEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  from: Bytes,
  amount: BigInt,
  decimals: i32
): UnderlyingAssetTopUpEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.UnderlyingAssetTopUp);
  const event = new UnderlyingAssetTopUpEvent(id);
  event.eventName = EventName.UnderlyingAssetTopUp;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.from = from;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
