import { Address, Bytes } from "@graphprotocol/graph-ts";
import { Internal_AccessControl } from "../../generated/schema";

export function fetchAccessControl(address: Address): Internal_AccessControl {
  const id = address.concat(Bytes.fromUTF8("accesscontrol"));
  let accessControlEntity = Internal_AccessControl.load(id);

  if (!accessControlEntity) {
    accessControlEntity = new Internal_AccessControl(id);
    accessControlEntity.admins = [];
    accessControlEntity.supplyManagers = [];
    accessControlEntity.userManagers = [];
    accessControlEntity.signers = [];
    accessControlEntity.deploymentOwners = [];
    accessControlEntity.storageModifiers = [];
    accessControlEntity.save();
  }

  return accessControlEntity;
}
