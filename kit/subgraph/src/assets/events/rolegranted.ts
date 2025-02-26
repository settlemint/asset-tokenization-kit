import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RoleGrantedEvent } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function roleGrantedEvent(
  id: Bytes,
  timestamp: BigInt,
  emitter: Bytes,
  sender: Bytes,
  role: Bytes,
  account: Bytes,
): RoleGrantedEvent {
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
