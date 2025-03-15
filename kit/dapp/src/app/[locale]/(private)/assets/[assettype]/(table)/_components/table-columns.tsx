import type { AssetType } from "../../types";
import { bondColumns } from "./columns/bonds";
import { cryptocurrencyColumns } from "./columns/cryptocurrencies";
import { equityColumns } from "./columns/equities";
import { fundColumns } from "./columns/funds";
import { stablecoinColumns } from "./columns/stablecoins";
import { tokenizedDepositColumns } from "./columns/tokenizeddeposits";

export function getTableColumns(assettype: AssetType) {
  switch (assettype) {
    case "bonds":
      return bondColumns;
    case "cryptocurrencies":
      return cryptocurrencyColumns;
    case "stablecoins":
      return stablecoinColumns;
    case "tokenizeddeposits":
      return tokenizedDepositColumns;
    case "equities":
      return equityColumns;
    case "funds":
      return fundColumns;
  }
}
