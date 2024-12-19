import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Event_RoleAdminChanged, Event_RoleGranted, Event_RoleRevoked } from '../../generated/schema';
import { fetchAccount } from '../fetch/account';
import { assetRoleId, fetchAssetRole } from '../fetch/asset-role';
import { fetchRole } from '../fetch/role';
import { eventId } from './events';

// Common role hashes from OpenZeppelin AccessControl
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const SUPPLY_MANAGEMENT_ROLE = '0x47b7a6ef32f924153c4c0c2f871f8856bd114b4903c167827ef0f0694c583e27';
const USER_MANAGEMENT_ROLE = '0x4f218fa1cf3180113024eb1bbca508696a5a0f0ecafaeea4da87c53e5d465892';

function getRoleName(roleBytes: Bytes): string {
  let roleHex = roleBytes.toHexString();
  if (roleHex == DEFAULT_ADMIN_ROLE) return 'DEFAULT_ADMIN_ROLE';
  if (roleHex == SUPPLY_MANAGEMENT_ROLE) return 'SUPPLY_MANAGEMENT_ROLE';
  if (roleHex == USER_MANAGEMENT_ROLE) return 'USER_MANAGEMENT_ROLE';
  return roleHex; // Fallback to hex string if role is unknown
}

function getRoleId(assetId: Bytes, roleBytes: Bytes): Bytes {
  return assetId.concat(roleBytes);
}

export function handleRoleGrantedEvent(
  event: ethereum.Event,
  assetId: Bytes,
  role: Bytes,
  account: Address,
  sender: Address
): void {
  let roleId = getRoleId(assetId, role);
  let roleName = getRoleName(role);
  let roleEntity = fetchRole(roleId, roleName);
  let assetRole = fetchAssetRole(assetRoleId(assetId, roleEntity.id), assetId, roleEntity.id);
  let accountEntity = fetchAccount(account);
  let senderEntity = fetchAccount(sender);

  let members = assetRole.members;
  members.push(accountEntity.id);
  assetRole.members = members;
  assetRole.save();

  let eventRoleGranted = new Event_RoleGranted(eventId(event));
  eventRoleGranted.emitter = assetId;
  eventRoleGranted.timestamp = event.block.timestamp;
  eventRoleGranted.assetRole = assetRole.id;
  eventRoleGranted.account = accountEntity.id;
  eventRoleGranted.sender = senderEntity.id;
  eventRoleGranted.save();
}

export function handleRoleRevokedEvent(
  event: ethereum.Event,
  assetId: Bytes,
  role: Bytes,
  account: Address,
  sender: Address
): void {
  let roleId = getRoleId(assetId, role);
  let roleName = getRoleName(role);
  let roleEntity = fetchRole(roleId, roleName);
  let assetRole = fetchAssetRole(assetRoleId(assetId, roleEntity.id), assetId, roleEntity.id);
  let accountEntity = fetchAccount(account);
  let senderEntity = fetchAccount(sender);

  let members = assetRole.members;
  let index = members.indexOf(accountEntity.id);
  if (index > -1) {
    members.splice(index, 1);
  }
  assetRole.members = members;
  assetRole.save();

  let eventRoleRevoked = new Event_RoleRevoked(eventId(event));
  eventRoleRevoked.emitter = assetId;
  eventRoleRevoked.timestamp = event.block.timestamp;
  eventRoleRevoked.assetRole = assetRole.id;
  eventRoleRevoked.account = accountEntity.id;
  eventRoleRevoked.sender = senderEntity.id;
  eventRoleRevoked.save();
}

export function handleRoleAdminChangedEvent(
  event: ethereum.Event,
  assetId: Bytes,
  role: Bytes,
  newAdminRole: Bytes,
  previousAdminRole: Bytes
): void {
  let roleId = getRoleId(assetId, role);
  let newAdminRoleId = getRoleId(assetId, newAdminRole);
  let previousAdminRoleId = getRoleId(assetId, previousAdminRole);

  let roleName = getRoleName(role);
  let newAdminRoleName = getRoleName(newAdminRole);
  let previousAdminRoleName = getRoleName(previousAdminRole);

  let roleEntity = fetchRole(roleId, roleName);
  let newAdminRoleEntity = fetchRole(newAdminRoleId, newAdminRoleName);
  let previousAdminRoleEntity = fetchRole(previousAdminRoleId, previousAdminRoleName);

  let assetRole = fetchAssetRole(assetRoleId(assetId, roleEntity.id), assetId, roleEntity.id);
  let newAssetAdminRole = fetchAssetRole(assetRoleId(assetId, newAdminRoleEntity.id), assetId, newAdminRoleEntity.id);
  let previousAssetAdminRole = fetchAssetRole(
    assetRoleId(assetId, previousAdminRoleEntity.id),
    assetId,
    previousAdminRoleEntity.id
  );

  let eventRoleAdminChanged = new Event_RoleAdminChanged(eventId(event));
  eventRoleAdminChanged.emitter = assetId;
  eventRoleAdminChanged.timestamp = event.block.timestamp;
  eventRoleAdminChanged.role = assetRole.id;
  eventRoleAdminChanged.newAdminRole = newAssetAdminRole.id;
  eventRoleAdminChanged.previousAdminRole = previousAssetAdminRole.id;
  eventRoleAdminChanged.save();
}
