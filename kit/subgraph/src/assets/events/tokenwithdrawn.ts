import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, TokenWithdrawnEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function tokenWithdrawnEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  token: Bytes,
  to: Bytes,
  amount: BigInt,
  decimals: i32
): TokenWithdrawnEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.TokenWithdrawn);
  const event = new TokenWithdrawnEvent(id);
  event.eventName = EventName.TokenWithdrawn;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.token = token;
  event.to = to;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
