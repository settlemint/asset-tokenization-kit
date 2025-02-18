import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { RoleGrantedEvent } from '../../../generated/schema';
import { EventName } from '../../utils/enums';
import { assetEvent } from './asset';

export function roleGrantedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  role: Bytes,
  account: Bytes
): RoleGrantedEvent {
  assetEvent(id, timestamp, emitter, sender, EventName.RoleGranted);
  const roleGrantedEvent = new RoleGrantedEvent(id);
  roleGrantedEvent.eventName = EventName.RoleGranted;
  roleGrantedEvent.timestamp = timestamp;
  roleGrantedEvent.emitter = emitter;
  roleGrantedEvent.sender = sender;
  roleGrantedEvent.role = role;
  roleGrantedEvent.account = account;
  roleGrantedEvent.save();
  return roleGrantedEvent;
}
