import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, ApprovalEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function approvalEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  owner: Bytes,
  spender: Bytes,
  value: BigInt,
  decimals: i32
): ApprovalEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.Approval);
  const event = new ApprovalEvent(id);
  event.eventName = EventName.Approval;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.owner = owner;
  event.spender = spender;
  event.valueExact = value;
  event.value = toDecimals(value, decimals);
  event.save();

  return event;
}
