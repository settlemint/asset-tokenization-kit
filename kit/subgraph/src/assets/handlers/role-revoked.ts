import {
  Address,
  Bytes,
  Entity,
  ethereum,
  Value,
} from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../fetch/account";
import { createActivityLogEntry, EventType } from "../../fetch/activity-log";
import { Role } from "../../utils/enums";

export function roleRevokedHandler(
  event: ethereum.Event,
  asset: Entity,
  role: string,
  roleHolder: Address,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.RoleRevoked, [roleHolder, sender]);
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
    const newAdmins: Address[] = [];
    for (let i = 0; i < admins.length; i++) {
      if (!admins[i].equals(roleHolderAccount.id)) {
        newAdmins.push(admins[i]);
      }
    }
    asset.set("admins", Value.fromAddressArray(newAdmins));
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
    const newSupplyManagers: Address[] = [];
    for (let i = 0; i < supplyManagers.length; i++) {
      if (!supplyManagers[i].equals(roleHolderAccount.id)) {
        newSupplyManagers.push(supplyManagers[i]);
      }
    }
    asset.set("supplyManagers", Value.fromAddressArray(newSupplyManagers));
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
    const newUserManagers: Address[] = [];
    for (let i = 0; i < userManagers.length; i++) {
      if (!userManagers[i].equals(roleHolderAccount.id)) {
        newUserManagers.push(userManagers[i]);
      }
    }
    asset.set("userManagers", Value.fromAddressArray(newUserManagers));
    return;
  }

  return;
}
