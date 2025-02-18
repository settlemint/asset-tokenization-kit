import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, RoleRevokedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function roleRevokedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  role: Bytes,
  account: Bytes
): RoleRevokedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.RoleRevoked);
  const roleRevokedEvent = new RoleRevokedEvent(id);
  roleRevokedEvent.eventName = EventName.RoleRevoked;
  roleRevokedEvent.timestamp = timestamp;
  roleRevokedEvent.emitter = emitter;
  roleRevokedEvent.sender = sender.id;
  roleRevokedEvent.role = role;
  roleRevokedEvent.account = account;
  roleRevokedEvent.save();
  return roleRevokedEvent;
}
