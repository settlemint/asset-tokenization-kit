import { Bytes } from '@graphprotocol/graph-ts';
import { AssetRole } from '../../generated/schema';

export function fetchAssetRole(id: Bytes, assetId: Bytes, roleId: Bytes): AssetRole {
  let assetRole = AssetRole.load(id.toHexString());
  if (!assetRole) {
    assetRole = new AssetRole(id.toHexString());
    assetRole.asset = assetId;
    assetRole.role = roleId;
    assetRole.members = [];
    assetRole.save();
  }
  return assetRole;
}

export function assetRoleId(assetId: Bytes, roleId: Bytes): Bytes {
  return assetId.concat(roleId);
}
