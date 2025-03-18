import type { AssetType } from "@/lib/utils/zod";

export const freezeUserAssetsEnabled = (assettype: AssetType) =>
  assettype !== "cryptocurrency";
