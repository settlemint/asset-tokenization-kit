import type { AssetType } from "@atk/zod/asset-types";

export const ASSET_COLORS: Record<AssetType, string> = {
  bond: "var(--chart-1)",
  equity: "var(--chart-2)",
  fund: "var(--chart-3)",
  stablecoin: "var(--chart-4)",
  deposit: "var(--chart-5)",
};
