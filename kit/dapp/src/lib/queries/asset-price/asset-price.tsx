"use server";

import { fetchAllHasuraPages } from "@/lib/pagination";
import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import type { AssetPrice } from "@/lib/queries/asset-price/asset-price-fragment";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParse } from "@/lib/utils/typebox";
import type { Price } from "@/lib/utils/typebox/price";
import { cache } from "react";
import { getAddress } from "viem";
import type { CurrencyCode } from "../../db/schema-settings";
import { AssetPriceFragment } from "./asset-price-fragment";
import { AssetPriceSchema } from "./asset-price-schema";

const AssetPrices = hasuraGraphql(
  `
  query AssetPrices($assetIds: [String!]!, $limit: Int, $offset: Int) {
    asset_price(
      where: { asset_id: { _in: $assetIds } }
      order_by: { created_at: desc },
      limit: $limit,
      offset: $offset
    ) {
      ...AssetPriceFragment
    }
  }
`,
  [AssetPriceFragment]
);

const AssetPrice = hasuraGraphql(
  `
    query AssetPrice($assetId: String!) {
      asset_price(
        where: { asset_id: { _eq: $assetId } }
        order_by: { created_at: desc }
      ) {
        ...AssetPriceFragment
      }
    }
  `,
  [AssetPriceFragment]
);

export const getAssetsPricesInUserCurrency = cache(
  async (assetIds: string[]): Promise<Map<string, Price>> => {
    const userDetails = await getCurrentUserDetail();
    const assetIdsWithoutDuplicates = Array.from(new Set(assetIds));
    const assetPricesData = await fetchAllHasuraPages(
      async (pageLimit, offset) => {
        const assetIds = assetIdsWithoutDuplicates.map((address) => {
          return getAddress(address);
        });
        const pageResult = await hasuraClient.request(AssetPrices, {
          assetIds,
          limit: pageLimit,
          offset,
        });
        return pageResult.asset_price ?? [];
      }
    );
    const exchangeRates = await getExchangeRates(
      assetPricesData,
      userDetails.currency
    );
    const pricesForAssetIds = new Map();

    for (const assetId of assetIds) {
      const assetPrice = assetPricesData.find(
        (assetPrice) => getAddress(assetPrice.asset_id) === getAddress(assetId)
      );
      if (!assetPrice) {
        pricesForAssetIds.set(assetId, {
          amount: 0,
          currency: userDetails.currency,
        });
      } else {
        const validatedPrice = safeParse(AssetPriceSchema, assetPrice);
        const exchangeRate = exchangeRates.get(validatedPrice.currency);
        if (!exchangeRate) {
          throw new Error("Exchange rate not found");
        }
        pricesForAssetIds.set(assetId, {
          amount: validatedPrice.amount * exchangeRate,
          currency: userDetails.currency,
        });
      }
    }

    return pricesForAssetIds;
  }
);

const getExchangeRates = cache(
  async (assetPrices: AssetPrice[], userCurrency: CurrencyCode) => {
    const exchangeRates = new Map<string, number | null>();
    const currencyCodes = assetPrices.map(
      (assetPrice) => assetPrice.currency as CurrencyCode
    );
    const uniqueCurrencies = Array.from(new Set<CurrencyCode>(currencyCodes));
    await Promise.all(
      uniqueCurrencies.map(async (currency) => {
        const exchangeRate = await getExchangeRate(currency, userCurrency);
        exchangeRates.set(currency, exchangeRate);
      })
    );
    return exchangeRates;
  }
);
