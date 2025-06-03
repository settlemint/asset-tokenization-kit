import { Bytes, Value } from "@graphprotocol/graph-ts";
import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/AccessControl/AccessControl";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchAccessControl } from "./fetch/accesscontrol";
import { getRoleConfigFromBytes } from "./utils/role";

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  fetchEvent(event, "RoleAdminChanged");
}

export function handleRoleGranted(event: RoleGranted): void {
  fetchEvent(event, "RoleGranted");
  const roleHolder = fetchAccount(event.params.account);
  const accessControl = fetchAccessControl(event.address);

  const roleConfig = getRoleConfigFromBytes(event.params.role);

  let found = false;
  const value = accessControl.get(roleConfig.fieldName);
  let newValue: Bytes[] = [];
  if (!value) {
    newValue = [];
  } else {
    newValue = value.toBytesArray();
  }
  for (let i = 0; i < newValue.length; i++) {
    if (newValue[i].equals(roleHolder.id)) {
      found = true;
      break;
    }
  }
  if (!found) {
    accessControl.set(
      roleConfig.fieldName,
      Value.fromBytesArray(newValue.concat([roleHolder.id]))
    );
  }
  accessControl.save();
}

export function handleRoleRevoked(event: RoleRevoked): void {
  fetchEvent(event, "RoleRevoked");
  const roleHolder = fetchAccount(event.params.account);
  const accessControl = fetchAccessControl(event.address);

  const roleConfig = getRoleConfigFromBytes(event.params.role);

  const value = accessControl.get(roleConfig.fieldName);
  let newValue: Bytes[] = [];
  if (!value) {
    newValue = [];
  } else {
    newValue = value.toBytesArray();
  }
  const newAdmins: Bytes[] = [];
  for (let i = 0; i < newValue.length; i++) {
    if (!newValue[i].equals(roleHolder.id)) {
      newAdmins.push(newValue[i]);
    }
  }
  accessControl.set(roleConfig.fieldName, Value.fromBytesArray(newAdmins));
  accessControl.save();
}
