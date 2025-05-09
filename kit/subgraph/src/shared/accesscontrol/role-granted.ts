import { Address, Bytes, ethereum, Value } from "@graphprotocol/graph-ts";
import { RoleArrayMapping } from "../../enums/role";
import { fetchAccessControl } from "../../fetch/accesscontrol";
import { fetchAddress } from "../../fetch/address";
import { processEvent } from "../event";

export function roleGrantedHandler(
  event: ethereum.Event,
  role: Bytes,
  account: Address
): void {
  processEvent(event, "RoleGranted");
  const roleHolder = fetchAddress(account);
  const accessControl = fetchAccessControl(event.address);

  let found = false;
  const value = accessControl.get(RoleArrayMapping(role));
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
      RoleArrayMapping(role),
      Value.fromBytesArray(newValue.concat([roleHolder.id]))
    );
  }
  accessControl.save();
}
