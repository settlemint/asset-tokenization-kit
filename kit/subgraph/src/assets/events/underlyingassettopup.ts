import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { UnderlyingAssetTopUpEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';

export function underlyingAssetTopUpEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  from: Bytes,
  amount: BigInt,
  decimals: i32
): UnderlyingAssetTopUpEvent {
  const event = new UnderlyingAssetTopUpEvent(id);
  event.eventName = EventName.UnderlyingAssetTopUp;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender
  event.from = from;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
