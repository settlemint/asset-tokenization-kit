import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { BondColumns } from "./columns/bonds";
import { CryptocurrencyColumns } from "./columns/cryptocurrencies";
import { DepositColumns } from "./columns/deposits";
import { EquityColumns } from "./columns/equities";
import { FundColumns } from "./columns/funds";
import { StablecoinColumns } from "./columns/stablecoins";

export function getTableColumns(assettype: AssetType) {
  switch (assettype) {
    case "bond":
      return BondColumns;
    case "cryptocurrency":
      return CryptocurrencyColumns;
    case "stablecoin":
      return StablecoinColumns;
    case "deposit":
      return DepositColumns;
    case "equity":
      return EquityColumns;
    case "fund":
      return FundColumns;
    default:
      throw new Error("Invalid asset type");
  }
}
