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
 * preferred currency. For improved performance, it optimizes database access by:
 *
 * 1. Fetching all exchange rates for the target currency at once with getExchangeRatesForBase
 * 2. Creating a cached map of rates for quick lookups during conversion
 * 3. Only falling back to individual rate lookups when necessary
 *
 * This approach reduces database calls from O(n) to O(1) where n is the number of
 * different currencies in the asset list.
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
    if (asset.price && asset.price.amount > 0) {
      // For assets, we typically calculate the total supply × price
      // If totalSupply is available, use it; otherwise, use 1 as default amount
      const assetAmount = asset.totalSupply ? Number(asset.totalSupply) : 1;

      // Calculate the value in the asset's currency
      const assetValue = asset.price.amount * assetAmount;

      if (asset.price.currency === targetCurrency) {
        // No conversion needed if the asset is already in the target currency
        totalPrice += assetValue;
      } else {
        // Look up the exchange rate for this currency
        const rate = rateMap.get(asset.price.currency);
        if (rate !== undefined) {
          // targetCurrency is the base, asset.price.currency is the quote
          // To convert from quote to base currency, we divide by the rate
          // e.g., if 1 EUR = 1.1 USD, to convert 100 USD to EUR: 100 / 1.1 = 90.91 EUR
          totalPrice += assetValue / rate;
        } else {
          // Fall back to single exchange rate lookup if not in map
          const exchangeRate = await getExchangeRate(
            asset.price.currency,
            targetCurrency
          );
          if (exchangeRate !== null) {
            totalPrice += assetValue * exchangeRate;
          }
        }
      }
    }
  }

  return {
    totalPrice,
    currency: targetCurrency,
  };
});
