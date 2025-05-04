import {
  Address,
  Bytes,
  Entity,
  ethereum,
  Value,
} from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { Role } from "../../utils/enums";

export function roleGrantedHandler(
  event: ethereum.Event,
  asset: Entity,
  role: string,
  roleHolder: Address,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.RoleGranted, [roleHolder, sender]);
  const roleHolderAccount = fetchAccount(roleHolder);

  if (role == Role.DEFAULT_ADMIN_ROLE) {
    let found = false;
    const adminsValue = asset.get("admins");
    let admins: Bytes[] = [];
    if (!adminsValue) {
      admins = [];
    } else {
      admins = adminsValue.toBytesArray();
    }
    for (let i = 0; i < admins.length; i++) {
      if (admins[i].equals(roleHolderAccount.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      asset.set(
        "admins",
        Value.fromBytesArray(admins.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.SUPPLY_MANAGEMENT_ROLE) {
    let found = false;
    const supplyManagersValue = asset.get("supplyManagers");
    let supplyManagers: Bytes[] = [];
    if (!supplyManagersValue) {
      supplyManagers = [];
    } else {
      supplyManagers = supplyManagersValue.toBytesArray();
    }
    for (let i = 0; i < supplyManagers.length; i++) {
      if (supplyManagers[i].equals(roleHolderAccount.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      asset.set(
        "supplyManagers",
        Value.fromBytesArray(supplyManagers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.USER_MANAGEMENT_ROLE) {
    let found = false;
    const userManagersValue = asset.get("userManagers");
    let userManagers: Bytes[] = [];
    if (!userManagersValue) {
      userManagers = [];
    } else {
      userManagers = userManagersValue.toBytesArray();
    }
    for (let i = 0; i < userManagers.length; i++) {
      if (userManagers[i].equals(roleHolderAccount.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      asset.set(
        "userManagers",
        Value.fromBytesArray(userManagers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  return;
}
