import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { UserBlockedEvent } from '../../../generated/schema';
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

  return event;
}
