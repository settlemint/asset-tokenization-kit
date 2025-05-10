import { Address, Bytes, ethereum, Value } from "@graphprotocol/graph-ts";
import { RoleArrayMapping } from "../../enums/role";
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

  const value = accessControl.get(RoleArrayMapping(role));
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
  accessControl.set(RoleArrayMapping(role), Value.fromBytesArray(newValue));
  accessControl.save();
}
