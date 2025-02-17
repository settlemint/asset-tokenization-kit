import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetBalance, TokensUnfrozenEvent } from '../../../generated/schema';
import { assetBalanceId } from '../../fetch/balance';
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

  // Update the user's asset balance frozen amount
  const balanceId = assetBalanceId(emitter, user);
  const balance = AssetBalance.load(balanceId);
  if (balance !== null) {
    balance.frozen = balance.frozen.minus(amount);
    balance.save();
  }

  return event;
}
