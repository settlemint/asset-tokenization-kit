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
  static SwapCreated: string = "Swap Created";
  static SwapStatusChanged: string = "Swap Status Changed";
  static SwapClaimed: string = "Swap Claimed";
  static SwapRefunded: string = "Swap Refunded";
  static TokensLocked: string = "Tokens Locked";
}

// Add DvPSwap status type enum
export class SwapStatusType {
  static PendingCreation: string = "PENDING_CREATION";
  static Open: string = "OPEN";
  static Claimed: string = "CLAIMED";
  static Refunded: string = "REFUNDED";
  static Expired: string = "EXPIRED";
  static AwaitingApproval: string = "AWAITING_APPROVAL";
  static AwaitingClaimSecret: string = "AWAITING_CLAIM_SECRET";
  static Unknown: string = "UNKNOWN";
}
