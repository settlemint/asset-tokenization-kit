import { Address, Value, Bytes } from "@graphprotocol/graph-ts";
import {
  AccessControl,
  AccessControlRoleAdmin,
} from "../../../generated/schema";
import { AccessControl as AccessControlTemplate } from "../../../generated/templates";
import { setAccountContractName } from "../../account/utils/account-contract-name";
import { DEFAULT_ADMIN_ROLE, RoleConfig, Roles } from "../utils/role";

export function fetchAccessControl(address: Address): AccessControl {
  let accessControlEntity = AccessControl.load(address);

  if (!accessControlEntity) {
    accessControlEntity = new AccessControl(address);
    for (let i = 0; i < Roles.length; i++) {
      accessControlEntity.set(Roles[i].fieldName, Value.fromBytesArray([]));
    }
    // Initialize system field to zero address by default
    accessControlEntity.system = Bytes.empty();
    accessControlEntity.save();
    AccessControlTemplate.create(address);
    setAccountContractName(address, "Access Control");

    ensureRoleAdminMappings(accessControlEntity as AccessControl);
  }

  return accessControlEntity;
}

function getRoleAdminEntityId(
  accessControl: AccessControl,
  role: RoleConfig
): Bytes {
  return accessControl.id.concat(role.bytes);
}

function ensureRoleAdminMappings(accessControl: AccessControl): void {
  for (let i = 0; i < Roles.length; i++) {
    const role = Roles[i];
    const entityId = getRoleAdminEntityId(accessControl, role);
    const existing = AccessControlRoleAdmin.load(entityId);
    if (!existing) {
      setRoleAdminMapping(accessControl, role, DEFAULT_ADMIN_ROLE);
    }
  }
}

export function setRoleAdminMapping(
  accessControl: AccessControl,
  role: RoleConfig,
  adminRole: RoleConfig
): void {
  const entityId = getRoleAdminEntityId(accessControl, role);
  let mapping = AccessControlRoleAdmin.load(entityId);

  if (!mapping) {
    mapping = new AccessControlRoleAdmin(entityId);
    mapping.accessControl = accessControl.id;
    mapping.role = role.bytes;
    mapping.roleFieldName = role.fieldName;
  }

  mapping.adminRole = adminRole.bytes;
  mapping.adminFieldName = adminRole.fieldName;
  mapping.save();
}
