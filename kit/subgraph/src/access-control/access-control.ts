import { Address, Bytes, Value } from "@graphprotocol/graph-ts";
import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../../generated/templates/AccessControl/AccessControl";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { hasRegisteredIdentity } from "../identity-registry-storage/utils/identity-registry-storage-utils";
import { fetchAccountSystemStatsStateForSystem } from "../stats/account-stats";
import { decrementPendingIdentitiesCount } from "../stats/identity-stats";
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

    // Handle pending registrations tracking logic
    const systemAddress = Address.fromBytes(accessControl.system);
    const roleHolderAddress = Address.fromBytes(roleHolder.id);

    // Set isAdmin to true for this account in the system (always, regardless of registration status)
    const accountSystemStats = fetchAccountSystemStatsStateForSystem(
      roleHolderAddress,
      systemAddress
    );
    accountSystemStats.isAdmin = true;
    accountSystemStats.save();

    // Check if account has registered identity in this system
    const accountHasRegisteredIdentity = hasRegisteredIdentity(
      roleHolderAddress,
      systemAddress
    );

    // If no registered identity exists, decrement pending count
    if (!accountHasRegisteredIdentity) {
      const isContract = roleHolder.isContract;
      decrementPendingIdentitiesCount(systemAddress, isContract);
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
  for (let i = 0; i < newValue.length; i++) {
    if (!newValue[i].equals(roleHolder.id)) {
      newAdmins.push(newValue[i]);
    }
  }
  accessControl.set(roleConfig.fieldName, Value.fromBytesArray(newAdmins));
  accessControl.save();
}
