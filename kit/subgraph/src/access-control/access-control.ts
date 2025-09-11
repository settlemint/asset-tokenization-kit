import { Bytes, Value } from "@graphprotocol/graph-ts";
import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/AccessControl/AccessControl";
import { fetchAccount } from "../account/fetch/account";
import {
  decrementAccountRolesCount,
  incrementAccountRolesCount,
} from "../account/utils/account-role";
import { fetchEvent } from "../event/fetch/event";
import {
  decrementTokenRoleCount,
  incrementTokenRoleCount,
} from "../token-role/utils/token-role-utils";
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

    // Update global role count for the account
    incrementAccountRolesCount(event.params.account);

    // If this AccessControl belongs to a token, update TokenRole
    const tokenAddress = accessControl.token;
    if (tokenAddress) {
      incrementTokenRoleCount(tokenAddress, roleHolder.id);
    }
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
  let found = false;
  for (let i = 0; i < newValue.length; i++) {
    if (!newValue[i].equals(roleHolder.id)) {
      newAdmins.push(newValue[i]);
    } else {
      found = true;
    }
  }
  accessControl.set(roleConfig.fieldName, Value.fromBytesArray(newAdmins));

  if (found) {
    // Update global role count for the account
    decrementAccountRolesCount(event.params.account);

    // If this AccessControl belongs to a token, update TokenRole
    const tokenAddress = accessControl.token;
    if (tokenAddress) {
      decrementTokenRoleCount(tokenAddress, roleHolder.id);
    }
  }

  accessControl.save();
}
