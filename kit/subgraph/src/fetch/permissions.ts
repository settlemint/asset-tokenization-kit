enum PermissionRole {
  ADMIN
  SUPPLY_MANAGER
  USER_MANAGER
}

type Permission @entity {
  id: ID! # Composite key: assetId-accountId-role
  asset: Asset!
  account: Account!
  role: PermissionRole!
  grantedAt: BigInt!
}