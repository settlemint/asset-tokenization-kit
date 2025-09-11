import { Bytes, Value } from "@graphprotocol/graph-ts";
import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/AccessControl/AccessControl";
import { fetchAccount } from "../account/fetch/account";
import {
  decreaseAccountRolesCount,
  increaseAccountRolesCount,
} from "../account/utils/account-contract-name";
import { fetchEvent } from "../event/fetch/event";
import {
  decreaseTokenRoleCount,
  increaseTokenRoleCount,
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
    increaseAccountRolesCount(roleHolder.id);

    // If this AccessControl belongs to a token, update TokenRole
    const tokenAddress = accessControl.token;
    if (tokenAddress) {
      increaseTokenRoleCount(tokenAddress, roleHolder.id);
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
  let roleWasFound = false;
  for (let i = 0; i < newValue.length; i++) {
    if (!newValue[i].equals(roleHolder.id)) {
      newAdmins.push(newValue[i]);
    } else {
      roleWasFound = true;
    }
  }
  accessControl.set(roleConfig.fieldName, Value.fromBytesArray(newAdmins));

  // Only update counters if the role was actually found and removed
  if (roleWasFound) {
    // Update global role count for the account
    decreaseAccountRolesCount(roleHolder.id);

    // If this AccessControl belongs to a token, update TokenRole
    const tokenAddress = accessControl.token;
    if (tokenAddress) {
      decreaseTokenRoleCount(tokenAddress, roleHolder.id);
    }
  }

  accessControl.save();
}
