import type { AssetType } from "@/lib/utils/zod";

export const blocklistEnabled = (assettype: AssetType) =>
  assettype !== "cryptocurrency" && assettype !== "tokenizeddeposit";
