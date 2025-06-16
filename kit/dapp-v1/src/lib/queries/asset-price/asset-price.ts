import "server-only";

import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import { withTracing } from "@/lib/utils/sentry-tracing";
import type { Price } from "@/lib/utils/typebox/price";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import type { CurrencyCode } from "../../db/schema-settings";

// const AssetPrices = hasuraGraphql(
//   `
//   query AssetPrices($assetIds: [String!]!, $limit: Int, $offset: Int) {
//     asset_price(
//       where: { asset_id: { _in: $assetIds } }
//       order_by: { created_at: desc },
//       limit: $limit,
//       offset: $offset
//     ) {
//       ...AssetPriceFragment
//     }
//   }
// `,
//   [AssetPriceFragment]
// );

export const getAssetsPricesInUserCurrency = withTracing(
  "queries",
  "getAssetsPricesInUserCurrency",
  cache(
    async (
      assetIds: string[],
      userCurrency: CurrencyCode
    ): Promise<Map<Address, Price>> => {
      const assetPrices = await getAssetsPrice(assetIds);

      const exchangeRates = await getExchangeRates(
        Array.from(assetPrices.values()),
        userCurrency
      );

      // Convert prices to user currency
      const pricesInUserCurrency = new Map<Address, Price>();

      for (const [assetId, price] of assetPrices.entries()) {
        const exchangeRate = exchangeRates.get(price.currency);
        if (!exchangeRate) {
          throw new Error(
            `Exchange rate not found for currency: ${price.currency}`
          );
        }

        pricesInUserCurrency.set(assetId, {
          amount: price.amount * exchangeRate,
          currency: userCurrency,
        });
      }

      return pricesInUserCurrency;
    }
  )
);

export const getAssetsPrice = withTracing(
  "queries",
  "getAssetsPrice",
  cache(async (assets: string[]) => {
    "use cache";
    cacheTag("asset");

    const assetIds = Array.from(new Set(assets)).map((address) => {
      return getAddress(address);
    });
    // const assetPricesData = await fetchAllHasuraPages(
    //   async (pageLimit, offset) => {
    //     // const pageResult = await hasuraClient.request(
    //     //   AssetPrices,
    //     //   {
    //     //     assetIds,
    //     //     limit: pageLimit,
    //     //     offset,
    //     //   },
    //     //   {
    //     //     "X-GraphQL-Operation-Name": "AssetPrices",
    //     //     "X-GraphQL-Operation-Type": "query",
    //     //   }
    //     // );

    //     return [];
    //   }
    // );
    const pricesForAssetIds = new Map<Address, Price>();

    for (const assetId of assetIds) {
      // const assetPrice = assetPricesData.find((assetPrice) => {
      //   return assetPrice.asset_id === assetId;
      // });

      // if (!assetPrice) {
      console.log(`Asset price not found for ${assetId}`);
      continue;
      // }

      // const validatedPrice = safeParse(AssetPriceSchema, assetPrice);
      // pricesForAssetIds.set(assetId, validatedPrice);
    }

    return pricesForAssetIds;
  })
);

const getExchangeRates = withTracing(
  "queries",
  "getExchangeRates",
  cache(async (prices: Price[], userCurrency: CurrencyCode) => {
    const exchangeRates = new Map<string, number | null>();
    const currencyCodes = prices.map((price) => price.currency);
    const uniqueCurrencies = Array.from(new Set<CurrencyCode>(currencyCodes));
    await Promise.all(
      uniqueCurrencies.map(async (currency) => {
        const exchangeRate = await getExchangeRate(currency, userCurrency);
        exchangeRates.set(currency, exchangeRate);
      })
    );
    return exchangeRates;
  })
);
