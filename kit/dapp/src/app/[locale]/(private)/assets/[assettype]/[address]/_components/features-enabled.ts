import type { AssetType } from "@/lib/utils/typebox/asset-types";

export const hasBlocklist = (assettype: AssetType) =>
  assettype !== "cryptocurrency" && assettype !== "deposit";

export const hasAllowlist = (assettype: AssetType) => assettype === "deposit";

export const hasUnderlyingAsset = (assettype: AssetType) =>
  assettype === "bond" || assettype === "fund";

export const hasYield = (assettype: AssetType) => assettype === "bond";

export const hasFreeze = (assettype: AssetType) =>
  assettype !== "cryptocurrency";
