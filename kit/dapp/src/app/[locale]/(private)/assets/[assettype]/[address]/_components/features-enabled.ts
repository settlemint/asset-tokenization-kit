import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { checkMicaEnabled } from "./mica-server";

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
export const hasMica = async (assettype: AssetType, assetId: string) => {
  return await checkMicaEnabled(assettype, assetId);
};
