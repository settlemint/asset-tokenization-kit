import { Bytes } from '@graphprotocol/graph-ts';
import { Role } from '../../generated/schema';

export function fetchRole(roleId: Bytes, name: string): Role {
  let role = Role.load(roleId);
  if (!role) {
    role = new Role(roleId);
    role.name = name;
    role.save();
  }
  return role;
}
