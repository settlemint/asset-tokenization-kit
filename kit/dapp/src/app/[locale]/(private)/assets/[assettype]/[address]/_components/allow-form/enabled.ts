import type { AssetType } from "@/lib/utils/zod";

export const allowlistEnabled = (assettype: AssetType) =>
  assettype === "tokenizeddeposit";
