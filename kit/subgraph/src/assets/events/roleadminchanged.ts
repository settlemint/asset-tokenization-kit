import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { RoleAdminChangedEvent } from '../../../generated/schema';

export function roleAdminChangedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChangedEvent {
  const event = new RoleAdminChangedEvent(id);
  event.eventName = 'Role Admin Changed';
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.role = role;
  event.previousAdminRole = previousAdminRole;
  event.newAdminRole = newAdminRole;
  event.save();

  return event;
}
