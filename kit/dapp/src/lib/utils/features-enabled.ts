import type { AssetType } from "@atk/zod/asset-types";
import type { Address } from "viem";

/**
 * Checks if an asset type supports blocklist functionality
 */
export const hasBlocklist = (assetType: AssetType): boolean =>
  assetType !== "deposit";

/**
 * Checks if an asset type supports allowlist functionality
 */
export const hasAllowlist = (assetType: AssetType): boolean =>
  assetType === "deposit";

/**
 * Checks if an asset type supports underlying assets
 */
export const hasUnderlyingAssets = (assetType: AssetType): boolean =>
  assetType === "fund";

export const hasDenominationAsset = (assetType: AssetType): boolean =>
  assetType === "bond";

/**
 * Checks if an asset type supports yield functionality
 */
export const hasYield = (assetType: AssetType): boolean => assetType === "bond";

/**
 * Checks if an asset type supports freeze functionality
 */
export const hasFreeze = (_assetType: AssetType): boolean => true;

/**
 * Check if MICA regulation is available and enabled for an asset type
 * @param assetType The type of asset to check
 * @param assetAddress The address of the asset to check
 * @returns True if MICA is available and enabled for this asset
 */
export const isMicaEnabledForAsset = (
  assetType: AssetType,
  _assetAddress: Address
): boolean => {
  // MICA is only available for stablecoins
  const isAvailable = assetType === "stablecoin";
  if (!isAvailable) {
    return false;
  }

  // TODO: Implement feature flag check when available
  // const isFeatureFlagEnabled = await isFeatureEnabled("mica");
  // if (!isFeatureFlagEnabled) {
  //   return false;
  // }

  // TODO: Implement regulation enabled check when available
  // return await isRegulationEnabled(assetAddress, "mica");

  // For now, return false until the infrastructure is implemented
  return false;
};
