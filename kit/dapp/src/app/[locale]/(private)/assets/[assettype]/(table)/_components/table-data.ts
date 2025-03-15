import { getBondList } from "@/lib/queries/bond/bond-list";
import { getCryptoCurrencyList } from "@/lib/queries/cryptocurrency/cryptocurrency-list";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import { getFundList } from "@/lib/queries/fund/fund-list";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import { getTokenizedDepositList } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-list";
import type { AssetType } from "../../types";

export function getTableData(assettype: AssetType) {
  switch (assettype) {
    case "bonds":
      return getBondList();
    case "cryptocurrencies":
      return getCryptoCurrencyList();
    case "stablecoins":
      return getStableCoinList();
    case "tokenizeddeposits":
      return getTokenizedDepositList();
    case "equities":
      return getEquityList();
    case "funds":
      return getFundList();
  }
}
