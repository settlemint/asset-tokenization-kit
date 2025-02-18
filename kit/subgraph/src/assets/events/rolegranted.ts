import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Account, RoleGrantedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetActivityEvent } from './assetactivity';

export function roleGrantedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Account,
  role: Bytes,
  account: Bytes
): RoleGrantedEvent {
  assetActivityEvent(id, timestamp, emitter, sender, EventName.RoleGranted);
  const roleGrantedEvent = new RoleGrantedEvent(id);
  roleGrantedEvent.eventName = EventName.RoleGranted;
  roleGrantedEvent.timestamp = timestamp;
  roleGrantedEvent.emitter = emitter;
  roleGrantedEvent.sender = sender.id;
  roleGrantedEvent.role = role;
  roleGrantedEvent.account = account;
  roleGrantedEvent.save();
  return roleGrantedEvent;
}
