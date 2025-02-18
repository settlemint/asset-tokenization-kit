import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, UserBlockedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function userBlockedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  user: Bytes
): UserBlockedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.UserBlocked);
  const event = new UserBlockedEvent(id);
  event.eventName = EventName.UserBlocked;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.user = user;
  event.save();

  return event;
}
