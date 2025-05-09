import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Address as AddressEntity } from "../../generated/schema";

export function fetchAddress(address: Address): AddressEntity {
  let addressEntity = AddressEntity.load(address);

  if (!addressEntity) {
    addressEntity = new AddressEntity(address);
    if (ethereum.hasCode(address).inner) {
      addressEntity.isContract = true;
    } else {
      addressEntity.isContract = false;
    }
    addressEntity.save();
  }

  return addressEntity;
}
