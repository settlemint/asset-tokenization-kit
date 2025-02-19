// These need to match the keys of the assetConfig object in the dapp
import { assetConfig } from '../../../dapp/src/lib/config/assets';

export class AssetType {
  static bond: string = assetConfig.bond.queryKey;
  static equity: string = assetConfig.equity.queryKey;
  static stablecoin: string = assetConfig.stablecoin.queryKey;
  static cryptocurrency: string = assetConfig.cryptocurrency.queryKey;
  static fund: string = assetConfig.fund.queryKey;
}

export class FactoryType {
  static bond: string = assetConfig.bond.queryKey;
  static equity: string = assetConfig.equity.queryKey;
  static stablecoin: string = assetConfig.stablecoin.queryKey;
  static cryptocurrency: string = assetConfig.cryptocurrency.queryKey;
  static fund: string = assetConfig.fund.queryKey;
  static fixedyield: string = 'fixedyield';
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
}