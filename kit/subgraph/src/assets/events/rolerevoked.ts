import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { RoleRevokedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function roleRevokedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  role: Bytes,
  account: Bytes
): RoleRevokedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.RoleRevoked);
  const roleRevokedEvent = new RoleRevokedEvent(id);
  roleRevokedEvent.eventName = EventName.RoleRevoked;
  roleRevokedEvent.timestamp = timestamp;
  roleRevokedEvent.emitter = emitter;
  roleRevokedEvent.sender = sender;
  roleRevokedEvent.role = role;
  roleRevokedEvent.account = account;
  roleRevokedEvent.save();
  return roleRevokedEvent;
}
