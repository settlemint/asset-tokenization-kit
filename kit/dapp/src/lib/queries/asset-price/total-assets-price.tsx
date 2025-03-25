import { getFundList } from "@/lib/queries/fund/fund-list";
import { cache } from "react";
import { getBondList } from "../bond/bond-list";
import { getCryptoCurrencyList } from "../cryptocurrency/cryptocurrency-list";
import { getEquityList } from "../equity/equity-list";
import { getStableCoinList } from "../stablecoin/stablecoin-list";
import { getTokenizedDepositList } from "../tokenizeddeposit/tokenizeddeposit-list";
import { getCurrentUserCurrency } from "../user/user-currency";

/**
 * Gets the total price across all assets in the user's preferred currency
 */
export const getTotalAssetPrice = cache(async () => {
  const [targetCurrency, ...assetsResult] = await Promise.all([
    await getCurrentUserCurrency(),
    await getBondList(),
    await getCryptoCurrencyList(),
    await getEquityList(),
    await getFundList(),
    await getStableCoinList(),
    await getTokenizedDepositList(),
  ]);

  const assets = assetsResult.flat();

  const totalPrice = assets.reduce(
    (sum, asset) => sum + asset.price * asset.totalSupply,
    0
  );

  return {
    totalPrice,
    currency: targetCurrency,
  };
});
