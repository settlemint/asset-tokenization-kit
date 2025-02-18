import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, UnderlyingAssetWithdrawnEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function underlyingAssetWithdrawnEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  to: Bytes,
  amount: BigInt,
  decimals: i32
): UnderlyingAssetWithdrawnEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.UnderlyingAssetWithdrawn);
  const event = new UnderlyingAssetWithdrawnEvent(id);
  event.eventName = EventName.UnderlyingAssetWithdrawn;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.to = to;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
