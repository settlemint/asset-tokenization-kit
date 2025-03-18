import type { AssetType } from "@/lib/utils/zod";

export const blockUserEnabled = (assettype: AssetType) =>
  assettype !== "cryptocurrency" && assettype !== "tokenizeddeposit";
