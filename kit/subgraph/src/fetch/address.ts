import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Address as AddressEntity } from "../../generated/schema";
import { fetchAccessControl } from "./accesscontrol";

export function fetchAddress(address: Address): AddressEntity {
  let addressEntity = AddressEntity.load(address);

  if (!addressEntity) {
    addressEntity = new AddressEntity(address);
    if (ethereum.hasCode(address).inner) {
      addressEntity.isContract = true;
      const accessControl = fetchAccessControl(address);
      addressEntity.asAccessControl = accessControl.id;
    } else {
      addressEntity.isContract = false;
    }
    addressEntity.save();
  }

  return addressEntity;
}
