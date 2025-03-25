import {
  getExchangeRate,
  getExchangeRatesForBase,
} from "@/lib/providers/exchange-rates/exchange-rates";
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
  const targetCurrency = userDetails.currency;

  // Fetch all exchange rates for the target currency at once
  const exchangeRates = await getExchangeRatesForBase(targetCurrency);

  // Create a map for quick lookups of exchange rates
  const rateMap = new Map();
  exchangeRates.forEach((rateObj) => {
    rateMap.set(
      rateObj.quoteCurrency,
      Number.parseFloat(rateObj.rate.toString())
    );
  });

  let totalPrice = 0;

  // Calculate the total price by converting each asset's price to the user's currency
  for (const asset of assets) {
    // Skip assets with no price or zero price
    if (!asset.price || asset.price.amount <= 0) continue;

    // For assets, we typically calculate the total supply × price
    const assetAmount = asset.totalSupply ? Number(asset.totalSupply) : 0;

    // Calculate the value in the asset's currency
    const assetValue = asset.price.amount * assetAmount;

    // No conversion needed if the asset is already in the target currency
    if (asset.price.currency === targetCurrency) {
      totalPrice += assetValue;
      continue;
    }

    // Look up the exchange rate for this currency
    const rate = rateMap.get(asset.price.currency);
    if (rate !== undefined) {
      // targetCurrency is the base, asset.price.currency is the quote
      // To convert from quote to base currency, we divide by the rate
      totalPrice += assetValue / rate;
      continue;
    }

    // Fall back to single exchange rate lookup if not in map
    const exchangeRate = await getExchangeRate(
      asset.price.currency,
      targetCurrency
    );

    if (exchangeRate !== null) {
      totalPrice += assetValue * exchangeRate;
    }
  }

  return {
    totalPrice,
    currency: targetCurrency,
  };
});
