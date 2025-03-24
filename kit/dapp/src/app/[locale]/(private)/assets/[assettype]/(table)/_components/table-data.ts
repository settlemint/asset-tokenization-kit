import { getBondList } from "@/lib/queries/bond/bond-list";
import { getCryptoCurrencyList } from "@/lib/queries/cryptocurrency/cryptocurrency-list";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import { getFundList } from "@/lib/queries/fund/fund-list";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import { getTokenizedDepositList } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-list";
import type { AssetType } from "@/lib/utils/typebox/asset-types";

export function getTableData(assettype: AssetType) {
  switch (assettype) {
    case "bond":
      return getBondList();
    case "cryptocurrency":
      return getCryptoCurrencyList();
    case "stablecoin":
      return getStableCoinList();
    case "tokenizeddeposit":
      return getTokenizedDepositList();
    case "equity":
      return getEquityList();
    case "fund":
      return getFundList();
    default:
      throw new Error("Invalid asset type");
  }
}
