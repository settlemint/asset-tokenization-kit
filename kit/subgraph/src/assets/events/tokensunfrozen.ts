import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, TokensUnfrozenEvent } from '../../../generated/schema';
import { toDecimals } from '../../utils/decimals';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function tokensUnfrozenEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  user: Bytes,
  amount: BigInt,
  decimals: i32
): TokensUnfrozenEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.TokensUnfrozen);
  const event = new TokensUnfrozenEvent(id);
  event.eventName = EventName.TokensUnfrozen;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.user = user;
  event.amount = toDecimals(amount, decimals);
  event.amountExact = amount;
  event.save();

  return event;
}
