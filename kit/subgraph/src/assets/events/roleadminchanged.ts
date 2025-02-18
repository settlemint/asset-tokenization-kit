import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { RoleAdminChangedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function roleAdminChangedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChangedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.RoleAdminChanged);
  const event = new RoleAdminChangedEvent(id);
  event.eventName = EventName.RoleAdminChanged;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender;
  event.role = role;
  event.previousAdminRole = previousAdminRole;
  event.newAdminRole = newAdminRole;
  event.save();

  return event;
}
