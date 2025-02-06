import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { ManagementFeeCollectedEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';

export function managementFeeCollectedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  amount: BigInt,
  decimals: i32
): ManagementFeeCollectedEvent {
  const event = new ManagementFeeCollectedEvent(id);
  event.eventName = 'Management Fee Collected';
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
