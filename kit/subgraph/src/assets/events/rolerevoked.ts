import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { RoleRevokedEvent } from '../../../generated/schema';

export function roleRevokedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  role: Bytes,
  account: Bytes
): RoleRevokedEvent {
  const roleRevokedEvent = new RoleRevokedEvent(id);
  roleRevokedEvent.eventName = 'RoleRevoked';
  roleRevokedEvent.timestamp = timestamp;
  roleRevokedEvent.emitter = emitter;
  roleRevokedEvent.sender = sender;
  roleRevokedEvent.role = role;
  roleRevokedEvent.account = account;
  roleRevokedEvent.save();
  return roleRevokedEvent;
}
