import { Address, Value } from "@graphprotocol/graph-ts";
import { AccessControl } from "../../../generated/schema";
import { AccessControl as AccessControlTemplate } from "../../../generated/templates";
import { setAccountContractName } from "../../account/utils/account-contract-name";
import { Roles } from "../utils/role";

export function fetchAccessControl(address: Address): AccessControl {
  let accessControlEntity = AccessControl.load(address);

  if (!accessControlEntity) {
    accessControlEntity = new AccessControl(address);
    for (let i = 0; i < Roles.length; i++) {
      accessControlEntity.set(Roles[i].fieldName, Value.fromBytesArray([]));
    }
    accessControlEntity.system = Address.zero();
    accessControlEntity.save();
    AccessControlTemplate.create(address);
    setAccountContractName(address, "Access Control");
  }

  return accessControlEntity;
}
