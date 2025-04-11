import { getFundList } from "@/lib/queries/fund/fund-list";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import { withTracing } from "@/lib/utils/tracing";
import { getBondList } from "../bond/bond-list";
import { getCryptoCurrencyList } from "../cryptocurrency/cryptocurrency-list";
import { getDepositList } from "../deposit/deposit-list";
import { getEquityList } from "../equity/equity-list";
import { getStableCoinList } from "../stablecoin/stablecoin-list";

/**
 * Gets the total price across all assets in the user's preferred currency
 *
 * This function fetches all asset types, then calculates their total value in the user's
 * preferred currency.
 */
export const getTotalAssetPrice = withTracing(
  "queries",
  "getTotalAssetPrice",
  async () => {
    const [userDetails, ...assetsResult] = await Promise.all([
      await getCurrentUserDetail(),
      await getBondList(),
      await getCryptoCurrencyList(),
      await getEquityList(),
      await getFundList(),
      await getStableCoinList(),
      await getDepositList(),
    ]);

    const assets = assetsResult.flat();
    const totalPrice = assets.reduce((acc, asset) => {
      return acc + (asset.price?.amount ?? 0) * asset.totalSupply;
    }, 0);

    return {
      totalPrice,
      currency: userDetails.currency,
    };
  }
);
