import { isRegulationEnabled } from "@/lib/queries/regulations/regulation-enabled";
import { isFeatureEnabled } from "@/lib/utils/feature-flags";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Address } from "viem";

export const hasBlocklist = (assettype: AssetType) =>
  assettype !== "cryptocurrency" && assettype !== "deposit";

export const hasAllowlist = (assettype: AssetType) => assettype === "deposit";

export const hasUnderlyingAsset = (assettype: AssetType) =>
  assettype === "bond" || assettype === "fund";

export const hasYield = (assettype: AssetType) => assettype === "bond";

export const hasFreeze = (assettype: AssetType) =>
  assettype !== "cryptocurrency";

/**
 * Check if MICA regulation is available and enabled for an asset type
 * @param assettype The type of asset to check
 * @param assetId The ID of the asset to check
 * @returns True if MICA is available and enabled for this asset
 */
export const isMicaEnabledForAsset = async (
  assettype: AssetType,
  assetId: Address
) => {
  const isAvailable = assettype === "stablecoin";
  if (!isAvailable) {
    return false;
  }

  const isFeatureFlagEnabled = await isFeatureEnabled("mica");
  if (!isFeatureFlagEnabled) {
    return false;
  }

  return await isRegulationEnabled(assetId, "mica");
};
