import { Address, Bytes } from "@graphprotocol/graph-ts";
import { AccessControl } from "../../generated/schema";

export function fetchAccessControl(address: Address): AccessControl {
  const id = address.concat(Bytes.fromUTF8("accesscontrol"));
  let accessControlEntity = AccessControl.load(id);

  if (!accessControlEntity) {
    accessControlEntity = new AccessControl(id);
    accessControlEntity.admins = [];
    accessControlEntity.supplyManagers = [];
    accessControlEntity.userManagers = [];
    accessControlEntity.signers = [];
    accessControlEntity.deploymentOwners = [];
    accessControlEntity.save();
  }

  return accessControlEntity;
}
