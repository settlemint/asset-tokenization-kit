import { Address, Bytes, ethereum, Value } from "@graphprotocol/graph-ts";
import { getRoleConfigFromBytes } from "../../enums/role";
import { fetchAccessControl } from "../../fetch/accesscontrol";
import { fetchAccount } from "../../fetch/account";
import { processEvent } from "../event";

export function roleRevokedHandler(
  event: ethereum.Event,
  role: Bytes,
  account: Address
): void {
  processEvent(event, "RoleGranted");
  const roleHolder = fetchAccount(account);
  const accessControl = fetchAccessControl(event.address);

  const roleConfig = getRoleConfigFromBytes(role);

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
  accessControl.set(roleConfig.fieldName, Value.fromBytesArray(newValue));
  accessControl.save();
}
