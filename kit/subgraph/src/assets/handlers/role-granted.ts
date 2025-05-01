import { Address, Entity, Value } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../fetch/account";
import { Role } from "../../utils/enums";

export function roleGrantedHandler(
  asset: Entity,
  role: string,
  roleHolder: Address
): void {
  const roleHolderAccount = fetchAccount(roleHolder);

  if (role == Role.DEFAULT_ADMIN_ROLE) {
    let found = false;
    const adminsValue = asset.get("admins");
    let admins = adminsValue?.toBytesArray();
    if (!admins) {
      admins = [];
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
        Value.fromAddressArray(admins.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.SUPPLY_MANAGEMENT_ROLE) {
    let found = false;
    const supplyManagersValue = asset.get("supplyManagers");
    let supplyManagers = supplyManagersValue?.toBytesArray();
    if (!supplyManagers) {
      supplyManagers = [];
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
        Value.fromAddressArray(supplyManagers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  if (role == Role.USER_MANAGEMENT_ROLE) {
    let found = false;
    const userManagersValue = asset.get("userManagers");
    let userManagers = userManagersValue?.toBytesArray();
    if (!userManagers) {
      userManagers = [];
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
        Value.fromAddressArray(userManagers.concat([roleHolderAccount.id]))
      );
    }
    return;
  }

  return;
}
