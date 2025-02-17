import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetBalance, UserUnblockedEvent } from '../../../generated/schema';
import { assetBalanceId } from '../../fetch/balance';
import { EventName } from '../../utils/enums';

export function userUnblockedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  user: Bytes
): UserUnblockedEvent {
  const event = new UserUnblockedEvent(id);
  event.eventName = EventName.UserUnblocked;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.user = user;
  event.save();

  // Update the user's asset balance blocked status
  const balanceId = assetBalanceId(emitter, user);
  const balance = AssetBalance.load(balanceId);
  if (balance !== null) {
    balance.blocked = false;
    balance.save();
  }

  return event;
}
