import { type CurrencyCode, SETTING_KEYS } from "@/lib/db/schema-settings";
import { fetchAllHasuraPages } from "@/lib/pagination";
import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { z } from "zod";

const AssetSchema = z.object({
  id: z.string(),
  value_in_base_currency: z.string().nullable(),
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
export const getTotalAssetPrice = cache(
  async (targetCurrency: CurrencyCode) => {
    const [dbAssets, settingsResult] = await Promise.all([
      await fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(AssetPrices, {
          limit: pageLimit,
          offset,
        });
        return result.asset || [];
      }),
      hasuraClient.request(Settings),
    ]);

    console.log(dbAssets);

    // Validate asset data
    const validatedAssets = safeParseWithLogging(
      AssetsResponseSchema,
      dbAssets,
      "asset prices"
    );

    if (validatedAssets.length === 0) {
      return 0;
    }

    const baseCurrency = settingsResult.settings.find(
      (setting) => setting.key === SETTING_KEYS.BASE_CURRENCY
    )?.value as CurrencyCode;

    const totalPriceInBaseCurrency = validatedAssets.reduce(
      (acc, asset) =>
        asset.value_in_base_currency
          ? acc + parseFloat(asset.value_in_base_currency)
          : acc,
      0
    );

    const exchangeRate = await getExchangeRate(baseCurrency, targetCurrency);
    if (!exchangeRate) {
      throw new Error(
        `Exchange rate not found for base currency ${baseCurrency} and target currency ${targetCurrency}`
      );
    }
    return totalPriceInBaseCurrency * exchangeRate;
  }
);
