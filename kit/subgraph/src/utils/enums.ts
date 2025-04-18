// These need to match the keys of the assetConfig object in the dapp
export class AssetType {
  static bond: string = "bond";
  static equity: string = "equity";
  static stablecoin: string = "stablecoin";
  static cryptocurrency: string = "cryptocurrency";
  static fund: string = "fund";
  static deposit: string = "deposit";
  static dvpswap: string = "dvpswap";
}

export class FactoryType {
  static bond: string = "bond";
  static equity: string = "equity";
  static stablecoin: string = "stablecoin";
  static cryptocurrency: string = "cryptocurrency";
  static fund: string = "fund";
  static fixedyield: string = "fixedyield";
  static deposit: string = "deposit";
  static dvpswap: string = "dvpswap";
}

export class EventName {
  static AssetCreated: string = "Asset Created";
  static Transfer: string = "Transfer";
  static Mint: string = "Mint";
  static Burn: string = "Burn";
  static RoleGranted: string = "Role Granted";
  static RoleRevoked: string = "Role Revoked";
  static RoleAdminChanged: string = "Role Admin Changed";
  static Approval: string = "Approval";
  static Paused: string = "Paused";
  static Unpaused: string = "Unpaused";
  static TokensFrozen: string = "Assets Frozen";
  static TokensUnfrozen: string = "Assets Unfrozen";
  static UserBlocked: string = "User Blocked";
  static UserUnblocked: string = "User Unblocked";
  static UserAllowed: string = "User Allowed";
  static UserDisallowed: string = "User Disallowed";
  static Clawback: string = "Clawback";
  // Bond specific events
  static BondMatured: string = "Bond Matured";
  static BondRedeemed: string = "Bond Redeemed";
  // Fixed yield specific events
  static YieldClaimed: string = "Yield Claimed";
  static FixedYieldCreated: string = "Fixed Yield Created";
  // Fund specific events
  static ManagementFeeCollected: string = "Management Fee Collected";
  static PerformanceFeeCollected: string = "Performance Fee Collected";
  static TokenWithdrawn: string = "Token Withdrawn";
  // Bond and Fixed yield specific events
  static UnderlyingAssetTopUp: string = "Underlying Asset Topped Up";
  static UnderlyingAssetWithdrawn: string = "Underlying Asset Withdrawn";
  // Stablecoin specific events
  static CollateralUpdated: string = "Collateral Updated";
  // DvPSwap specific events
  static DvPSwapContractCreated: string = "DvPSwap Contract Created";
  static DvPSwapCreated: string = "DvPSwap Created";
  static DvPSwapStatusChanged: string = "DvPSwap Status Changed";
  static DvPSwapClaimed: string = "DvPSwap Claimed";
  static DvPSwapRefunded: string = "DvPSwap Refunded";
  static TokensLocked: string = "Tokens Locked";
}

// Update DvPSwap status type enum to match the contract
export class DvPSwapStatusType {
  static PENDING_CREATION: string = "PENDING_CREATION";
  static OPEN: string = "OPEN";
  static CLAIMED: string = "CLAIMED";
  static REFUNDED: string = "REFUNDED";
  static EXPIRED: string = "EXPIRED";
  static CANCELLED: string = "CANCELLED";
  static FAILED: string = "FAILED";
  static INVALID: string = "INVALID";
  static AWAITING_APPROVAL: string = "AWAITING_APPROVAL";
  static AWAITING_CLAIM_SECRET: string = "AWAITING_CLAIM_SECRET";
}
