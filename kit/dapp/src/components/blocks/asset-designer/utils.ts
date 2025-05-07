import type { AssetType } from "@/lib/utils/typebox/asset-types";

// Get the description for the asset type
export function getAssetDescription(assetType?: AssetType | null): string {
  if (!assetType) return "general.description.default";

  switch (assetType) {
    case "bond":
      return "general.description.bond";
    case "cryptocurrency":
      return "general.description.cryptocurrency";
    case "equity":
      return "general.description.equity";
    case "fund":
      return "general.description.fund";
    case "stablecoin":
      return "general.description.stablecoin";
    case "deposit":
      return "general.description.deposit";
    default:
      return "general.description.default";
  }
}

export const getAssetTitle = (assetType: AssetType | null): string => {
  if (!assetType) return "general.title.default";

  switch (assetType) {
    case "bond":
      return "general.title.bond";
    case "cryptocurrency":
      return "general.title.cryptocurrency";
    case "equity":
      return "general.title.equity";
    case "fund":
      return "general.title.fund";
    case "stablecoin":
      return "general.title.stablecoin";
    case "deposit":
      return "general.title.deposit";
    default:
      return "general.title.default";
  }
};
