import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import type { Address } from "viem";
import type { AssetType } from "../utils/typebox/asset-types";

interface AssetDetailProps {
  assettype: AssetType;
  address: Address;
}

export function getAssetDetail({
  assettype,
  address,
}: AssetDetailProps):
  | ReturnType<typeof getBondDetail>
  | ReturnType<typeof getCryptoCurrencyDetail>
  | ReturnType<typeof getStableCoinDetail>
  | ReturnType<typeof getTokenizedDepositDetail>
  | ReturnType<typeof getEquityDetail>
  | ReturnType<typeof getFundDetail> {
  switch (assettype) {
    case "bond":
      return getBondDetail({ address });
    case "cryptocurrency":
      return getCryptoCurrencyDetail({ address });
    case "stablecoin":
      return getStableCoinDetail({ address });
    case "tokenizeddeposit":
      return getTokenizedDepositDetail({ address });
    case "equity":
      return getEquityDetail({ address });
    case "fund":
      return getFundDetail({ address });
    default:
      throw new Error("Invalid asset type");
  }
}
