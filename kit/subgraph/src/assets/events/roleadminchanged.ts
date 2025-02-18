import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, RoleAdminChangedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function roleAdminChangedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChangedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.RoleAdminChanged);
  const event = new RoleAdminChangedEvent(id);
  event.eventName = EventName.RoleAdminChanged;
  event.timestamp = timestamp;
  event.emitter = emitter;
  event.sender = sender.id;
  event.role = role;
  event.previousAdminRole = previousAdminRole;
  event.newAdminRole = newAdminRole;
  event.save();

  return event;
}
