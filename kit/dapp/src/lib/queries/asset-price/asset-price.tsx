"use server";

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
  query AssetPrices($assetIds: [String!]!) {
    asset_price(
      where: { asset_id: { _in: $assetIds } }
      order_by: { created_at: desc }
    ) {
      ...AssetPriceFragment
    }
  }
`,
  [AssetPriceFragment]
);

export const getAvailableAssetsPriceInUserCurrency = cache(
  async (assetIds: string[]): Promise<Map<string, Price>> => {
    const assetIdsWithoutDuplicates = Array.from(new Set(assetIds));
    const assetPricesData = await hasuraClient.request(AssetPrices, {
      assetIds: assetIdsWithoutDuplicates,
    });
    const assetPrices = assetPricesData.asset_price.map((assetPrice) => {
      const parsed = safeParse(AssetPriceSchema, assetPrice);
      return [assetPrice.asset_id, parsed] as [string, Price];
    });
    return new Map(assetPrices);
  }
);

export const getAssetsPricesInUserCurrency = cache(
  async (assetIds: string[]): Promise<Map<string, Price>> => {
    const userDetails = await getCurrentUserDetail();
    const assetIdsWithoutDuplicates = Array.from(
      new Set(assetIds.map(getAddress))
    );
    const assetPricesData = await hasuraClient.request(AssetPrices, {
      assetIds: assetIdsWithoutDuplicates,
    });
    const exchangeRates = await getExchangeRates(
      assetPricesData.asset_price,
      userDetails.currency
    );
    const pricesForAssetIds = new Map();
    for (const assetId of assetIds) {
      const assetPrice = assetPricesData.asset_price.find(
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
