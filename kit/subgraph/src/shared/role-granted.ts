import {
  Address,
  Bytes,
  Entity,
  ethereum,
  Value,
} from "@graphprotocol/graph-ts";
import { RoleMapping } from "../enums/role";
import { fetchAddress } from "../fetch/address";
import { processEvent } from "./event";

export function roleGrantedHandler(
  event: ethereum.Event,
  entity: Entity,
  role: string,
  account: Address
): void {
  processEvent(event, "RoleGranted");
  const roleHolder = fetchAddress(account);

  let found = false;
  const value = entity.get(RoleMapping[role]);
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
    entity.set(
      RoleMapping[role],
      Value.fromBytesArray(newValue.concat([roleHolder.id]))
    );
  }
}
