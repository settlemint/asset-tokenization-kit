import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { TokensUnfrozenEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';

export function tokensUnfrozenEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  user: Bytes,
  amount: BigInt,
  decimals: i32
): TokensUnfrozenEvent {
  const event = new TokensUnfrozenEvent(id);
  event.eventName = EventName.TokensUnfrozen;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.user = user;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();
  return event;
}
