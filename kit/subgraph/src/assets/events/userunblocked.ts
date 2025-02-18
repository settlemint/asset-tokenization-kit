import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, UserUnblockedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function userUnblockedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  user: Bytes
): UserUnblockedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.UserUnblocked);
  const event = new UserUnblockedEvent(id);
  event.eventName = EventName.UserUnblocked;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.user = user;
  event.save();

  return event;
}
