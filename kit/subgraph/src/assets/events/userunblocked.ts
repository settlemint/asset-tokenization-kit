import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { UserUnblockedEvent } from '../../../generated/schema';
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
  return event;
}
