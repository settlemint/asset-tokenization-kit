import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetBalance, UserBlockedEvent } from '../../../generated/schema';
import { assetBalanceId } from '../../fetch/balance';
import { EventName } from '../../utils/enums';

export function userBlockedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  user: Bytes
): UserBlockedEvent {
  const event = new UserBlockedEvent(id);
  event.eventName = EventName.UserBlocked;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.user = user;
  event.save();

  // Update the user's asset balance blocked status
  const balanceId = assetBalanceId(emitter, user);
  const balance = AssetBalance.load(balanceId);
  if (balance !== null) {
    balance.blocked = true;
    balance.save();
  }

  return event;
}
