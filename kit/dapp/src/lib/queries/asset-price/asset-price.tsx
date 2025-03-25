import { getUser } from "@/lib/auth/utils";
import { type CurrencyCode, SETTING_KEYS } from "@/lib/db/schema-settings";
import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import { getFundList } from "@/lib/queries/fund/fund-list";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { cache } from "react";
import { getBondList } from "../bond/bond-list";
import { getCryptoCurrencyList } from "../cryptocurrency/cryptocurrency-list";
import { getEquityList } from "../equity/equity-list";
import { getStableCoinList } from "../stablecoin/stablecoin-list";
import { getTokenizedDepositList } from "../tokenizeddeposit/tokenizeddeposit-list";
import { getUserDetail } from "../user/user-detail";

const Settings = hasuraGraphql(`
  query Settings {
    settings {
      key
      value
    }
  }
`);

/**
 * Gets the total price of all assets in the user's preferred currency
 */
export const getTotalAssetPrice = cache(async () => {
  const [settingsResult, targetCurrency, ...assetsResult] = await Promise.all([
    hasuraClient.request(Settings),
    (async () => {
      const user = await getUser();
      const userDetails = await getUserDetail({ id: user.id });
      return userDetails?.currency;
    })(),
    await getBondList(),
    await getCryptoCurrencyList(),
    await getEquityList(),
    await getFundList(),
    await getStableCoinList(),
    await getTokenizedDepositList(),
  ]);

  const baseCurrency =
    (settingsResult.settings.find(
      (setting) => setting.key === SETTING_KEYS.BASE_CURRENCY
    )?.value as CurrencyCode) ?? "EUR";
  const exchangeRate = await getExchangeRate(baseCurrency, targetCurrency);
  if (!exchangeRate) {
    throw new Error(
      `Exchange rate not found for base currency ${baseCurrency} and target currency ${targetCurrency}`
    );
  }

  const assets = assetsResult.flat();

  // Calculate total price by summing (totalSupply * value_in_base_currency * exchangeRate) for each asset
  const totalPrice = assets.reduce((sum, asset) => {
    const totalSupply = Number(asset.totalSupply);
    return (
      sum + totalSupply * (asset.value_in_base_currency || 0) * exchangeRate
    );
  }, 0);

  return {
    totalPrice,
    currency: targetCurrency,
  };
});
