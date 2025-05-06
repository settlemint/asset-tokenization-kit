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
  entity: Entity,
  role: string,
  roleHolder: Address,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.RoleGranted, sender, [roleHolder]);
  const roleHolderAccount = fetchAccount(roleHolder);

  if (role == Role.DEFAULT_ADMIN_ROLE) {
    let found = false;
    const adminsValue = entity.get("admins");
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
      entity.set(
        "admins",
        Value.fromBytesArray(admins.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.SUPPLY_MANAGEMENT_ROLE) {
    let found = false;
    const supplyManagersValue = entity.get("supplyManagers");
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
      entity.set(
        "supplyManagers",
        Value.fromBytesArray(supplyManagers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.USER_MANAGEMENT_ROLE) {
    let found = false;
    const userManagersValue = entity.get("userManagers");
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
      entity.set(
        "userManagers",
        Value.fromBytesArray(userManagers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.SIGNER_ROLE) {
    let found = false;
    const signersValue = entity.get("signers");
    let signers: Bytes[] = [];
    if (!signersValue) {
      signers = [];
    } else {
      signers = signersValue.toBytesArray();
    }
    for (let i = 0; i < signers.length; i++) {
      if (signers[i].equals(roleHolderAccount.id)) {
        found = true;
        break;
      }
    }
    if (!found) {
      entity.set(
        "signers",
        Value.fromBytesArray(signers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  return;
}
