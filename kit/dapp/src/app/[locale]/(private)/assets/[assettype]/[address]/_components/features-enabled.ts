import type { AssetType } from "@/lib/utils/zod";

export const hasBlocklist = (assettype: AssetType) =>
  assettype !== "cryptocurrency" && assettype !== "tokenizeddeposit";

export const hasAllowlist = (assettype: AssetType) =>
  assettype === "tokenizeddeposit";

export const hasUnderlyingAsset = (assettype: AssetType) =>
  assettype === "bond" || assettype === "fund";

export const hasYield = (assettype: AssetType) => assettype === "bond";

export const hasFreeze = (assettype: AssetType) =>
  assettype !== "cryptocurrency";
