import {
  Address,
  Bytes,
  Entity,
  ethereum,
  Value,
} from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../utils/account";
import { updateActionExecutors } from "../../utils/action";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { Role } from "../../utils/enums";

export function roleRevokedHandler(
  event: ethereum.Event,
  entity: Entity,
  role: string,
  roleHolder: Address,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.RoleRevoked, sender, [
    roleHolder,
    sender,
  ]);
  const roleHolderAccount = fetchAccount(roleHolder);

  if (role == Role.DEFAULT_ADMIN_ROLE) {
    const adminsValue = entity.get("admins");
    let admins: Bytes[] = [];
    if (!adminsValue) {
      admins = [];
    } else {
      admins = adminsValue.toBytesArray();
    }
    const newAdmins: Bytes[] = [];
    for (let i = 0; i < admins.length; i++) {
      if (!admins[i].equals(roleHolderAccount.id)) {
        newAdmins.push(admins[i]);
      }
    }
    entity.set("admins", Value.fromBytesArray(newAdmins));
    const id = entity.getBytes("id");
    if (id) {
      updateActionExecutors(id, Role.DEFAULT_ADMIN_ROLE, null, newAdmins);
    }
    return;
  }

  if (role == Role.SUPPLY_MANAGEMENT_ROLE) {
    const supplyManagersValue = entity.get("supplyManagers");
    let supplyManagers: Bytes[] = [];
    if (!supplyManagersValue) {
      supplyManagers = [];
    } else {
      supplyManagers = supplyManagersValue.toBytesArray();
    }
    const newSupplyManagers: Bytes[] = [];
    for (let i = 0; i < supplyManagers.length; i++) {
      if (!supplyManagers[i].equals(roleHolderAccount.id)) {
        newSupplyManagers.push(supplyManagers[i]);
      }
    }
    entity.set("supplyManagers", Value.fromBytesArray(newSupplyManagers));
    const id = entity.getBytes("id");
    if (id) {
      updateActionExecutors(
        id,
        Role.SUPPLY_MANAGEMENT_ROLE,
        null,
        newSupplyManagers
      );
    }
    return;
  }

  if (role == Role.USER_MANAGEMENT_ROLE) {
    const userManagersValue = entity.get("userManagers");
    let userManagers: Bytes[] = [];
    if (!userManagersValue) {
      userManagers = [];
    } else {
      userManagers = userManagersValue.toBytesArray();
    }
    const newUserManagers: Bytes[] = [];
    for (let i = 0; i < userManagers.length; i++) {
      if (!userManagers[i].equals(roleHolderAccount.id)) {
        newUserManagers.push(userManagers[i]);
      }
    }
    entity.set("userManagers", Value.fromBytesArray(newUserManagers));
    const id = entity.getBytes("id");
    if (id) {
      updateActionExecutors(
        id,
        Role.USER_MANAGEMENT_ROLE,
        null,
        newUserManagers
      );
    }
    return;
  }

  if (role == Role.SIGNER_ROLE) {
    const signersValue = entity.get("signers");
    let signers: Bytes[] = [];
    if (!signersValue) {
      signers = [];
    } else {
      signers = signersValue.toBytesArray();
    }
    const newSigners: Bytes[] = [];
    for (let i = 0; i < signers.length; i++) {
      if (!signers[i].equals(roleHolderAccount.id)) {
        newSigners.push(signers[i]);
      }
    }
    entity.set("signers", Value.fromBytesArray(newSigners));
    const id = entity.getBytes("id");
    if (id) {
      updateActionExecutors(id, Role.SIGNER_ROLE, null, newSigners);
    }
    return;
  }

  return;
}
