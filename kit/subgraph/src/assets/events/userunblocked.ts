import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { UserUnblockedEvent } from '../../../generated/schema';

export function userUnblockedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  user: Bytes
): UserUnblockedEvent {
  const event = new UserUnblockedEvent(id);
  event.eventName = 'User Unblocked';
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.user = user;
  event.save();
  return event;
}
