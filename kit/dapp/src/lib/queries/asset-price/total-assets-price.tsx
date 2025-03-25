import { getFundList } from "@/lib/queries/fund/fund-list";
import { cache } from "react";
import { getBondList } from "../bond/bond-list";
import { getCryptoCurrencyList } from "../cryptocurrency/cryptocurrency-list";
import { getEquityList } from "../equity/equity-list";
import { getStableCoinList } from "../stablecoin/stablecoin-list";
import { getTokenizedDepositList } from "../tokenizeddeposit/tokenizeddeposit-list";
import { getCurrentUserDetail } from "../user/current-user-detail";

/**
 * Gets the total price across all assets in the user's preferred currency
 *
 * This function fetches all asset types, then calculates their total value in the user's
 * preferred currency.
 */
export const getTotalAssetPrice = cache(async () => {
  const [userDetails, ...assetsResult] = await Promise.all([
    await getCurrentUserDetail(),
    await getBondList(),
    await getCryptoCurrencyList(),
    await getEquityList(),
    await getFundList(),
    await getStableCoinList(),
    await getTokenizedDepositList(),
  ]);

  const assets = assetsResult.flat();
  const totalPrice = assets.reduce((acc, asset) => {
    return acc + asset.price.amount * asset.totalSupply;
  }, 0);

  return {
    totalPrice,
    currency: userDetails.currency,
  };
});
