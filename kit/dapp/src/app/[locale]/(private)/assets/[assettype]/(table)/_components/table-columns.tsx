import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { bondColumns } from "./columns/bonds";
import { cryptocurrencyColumns } from "./columns/cryptocurrencies";
import { depositColumns } from "./columns/deposits";
import { equityColumns } from "./columns/equities";
import { fundColumns } from "./columns/funds";
import { stablecoinColumns } from "./columns/stablecoins";

export function getTableColumns(assettype: AssetType) {
  switch (assettype) {
    case "bond":
      return bondColumns;
    case "cryptocurrency":
      return cryptocurrencyColumns;
    case "stablecoin":
      return stablecoinColumns;
    case "deposit":
      return depositColumns;
    case "equity":
      return equityColumns;
    case "fund":
      return fundColumns;
    default:
      throw new Error("Invalid asset type");
  }
}
