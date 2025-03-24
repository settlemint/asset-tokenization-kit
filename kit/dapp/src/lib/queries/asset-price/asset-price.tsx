import { getUser } from "@/lib/auth/utils";
import { type CurrencyCode, SETTING_KEYS } from "@/lib/db/schema-settings";
import { fetchAllHasuraPages } from "@/lib/pagination";
import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { z } from "zod";
import { getUserDetail } from "../user/user-detail";

const AssetSchema = z.object({
  id: z.string(),
  value_in_base_currency: z.number().nullable(),
});

const AssetsResponseSchema = z.array(AssetSchema);

/**
 * GraphQL query to fetch all assets with their prices
 */
const AssetPrices = hasuraGraphql(`
  query Assets($limit: Int, $offset: Int) {
    asset(limit: $limit, offset: $offset) {
      id
      value_in_base_currency
    }
  }
`);

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
  const [dbAssets, settingsResult, targetCurrency] = await Promise.all([
    await fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(AssetPrices, {
        limit: pageLimit,
        offset,
      });
      return result.asset || [];
    }),
    hasuraClient.request(Settings),
    (async () => {
      const user = await getUser();
      const userDetails = await getUserDetail({ id: user.id });
      return userDetails?.currency;
    })(),
  ]);

  // Validate asset data
  const validatedAssets = safeParseWithLogging(
    AssetsResponseSchema,
    dbAssets,
    "asset prices"
  );

  if (validatedAssets.length === 0) {
    return {
      totalPrice: 0,
      currency: targetCurrency,
    };
  }
  const baseCurrency =
    (settingsResult.settings.find(
      (setting) => setting.key === SETTING_KEYS.BASE_CURRENCY
    )?.value as CurrencyCode) ?? "EUR";

  const totalPriceInBaseCurrency = validatedAssets.reduce(
    (acc, asset) => acc + (asset.value_in_base_currency ?? 0),
    0
  );

  const exchangeRate = await getExchangeRate(baseCurrency, targetCurrency);
  if (!exchangeRate) {
    throw new Error(
      `Exchange rate not found for base currency ${baseCurrency} and target currency ${targetCurrency}`
    );
  }
  return {
    totalPrice: totalPriceInBaseCurrency * exchangeRate,
    currency: targetCurrency,
  };
});
