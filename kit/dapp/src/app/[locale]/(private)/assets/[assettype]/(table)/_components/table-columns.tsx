import type { AssetType } from "@/lib/utils/zod";
import { bondColumns } from "./columns/bonds";
import { cryptocurrencyColumns } from "./columns/cryptocurrencies";
import { equityColumns } from "./columns/equities";
import { fundColumns } from "./columns/funds";
import { stablecoinColumns } from "./columns/stablecoins";
import { tokenizedDepositColumns } from "./columns/tokenizeddeposits";

export function getTableColumns(assettype: AssetType) {
  switch (assettype) {
    case "bond":
      return bondColumns;
    case "cryptocurrency":
      return cryptocurrencyColumns;
    case "stablecoin":
      return stablecoinColumns;
    case "tokenizeddeposit":
      return tokenizedDepositColumns;
    case "equity":
      return equityColumns;
    case "fund":
      return fundColumns;
    default:
      throw new Error("Invalid asset type");
  }
}
