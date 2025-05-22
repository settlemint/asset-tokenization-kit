import "server-only";

import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { Address } from "viem";
import { getUser } from "../auth/utils";
import type { AssetType } from "../utils/typebox/asset-types";

interface AssetDetailProps {
  assettype: AssetType;
  address: Address;
}

export async function getAssetDetail({
  assettype,
  address,
}: AssetDetailProps): Promise<
  | ReturnType<typeof getBondDetail>
  | ReturnType<typeof getCryptoCurrencyDetail>
  | ReturnType<typeof getStableCoinDetail>
  | ReturnType<typeof getDepositDetail>
  | ReturnType<typeof getEquityDetail>
  | ReturnType<typeof getFundDetail>
> {
  const user = await getUser();
  switch (assettype) {
    case "bond":
      return await getBondDetail({ address, userCurrency: user.currency });
    case "cryptocurrency":
      return await getCryptoCurrencyDetail({
        address,
        userCurrency: user.currency,
      });
    case "stablecoin":
      return getStableCoinDetail({ address, userCurrency: user.currency });
    case "deposit":
      return getDepositDetail({ address, userCurrency: user.currency });
    case "equity":
      return getEquityDetail({ address, userCurrency: user.currency });
    case "fund":
      return await getFundDetail({ address, userCurrency: user.currency });
    default:
      throw new Error("Invalid asset type");
  }
}
