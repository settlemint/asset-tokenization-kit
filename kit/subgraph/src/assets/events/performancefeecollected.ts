import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { PerformanceFeeCollectedEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';

export function performanceFeeCollectedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  amount: BigInt,
  decimals: i32
): PerformanceFeeCollectedEvent {
  const event = new PerformanceFeeCollectedEvent(id);
  event.eventName = EventName.PerformanceFeeCollected;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
