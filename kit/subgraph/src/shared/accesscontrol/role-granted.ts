import { Address, Bytes, ethereum, Value } from "@graphprotocol/graph-ts";
import { getRoleConfigFromBytes } from "../../enums/role";
import { fetchAccessControl } from "../../fetch/accesscontrol";
import { fetchAccount } from "../../fetch/account";
import { processEvent } from "../event";

export function roleGrantedHandler(
  event: ethereum.Event,
  role: Bytes,
  account: Address
): void {
  processEvent(event, "RoleGranted");
  const roleHolder = fetchAccount(account);
  const accessControl = fetchAccessControl(event.address);

  const roleConfig = getRoleConfigFromBytes(role);

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
  }
  accessControl.save();
}
