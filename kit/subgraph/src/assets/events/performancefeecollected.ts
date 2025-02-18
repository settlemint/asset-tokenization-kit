import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, PerformanceFeeCollectedEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function performanceFeeCollectedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  amount: BigInt,
  decimals: i32
): PerformanceFeeCollectedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.PerformanceFeeCollected);
  const event = new PerformanceFeeCollectedEvent(id);
  event.eventName = EventName.PerformanceFeeCollected;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
