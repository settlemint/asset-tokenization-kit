import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParse } from "@/lib/utils/typebox";
import type { Price } from "@/lib/utils/typebox/price";
import { cache } from "react";
import { getAddress } from "viem";
import { AssetPriceFragment } from "./asset-price-fragment";
import { AssetPriceSchema } from "./asset-price-schema";

const AssetPrice = hasuraGraphql(
  `
  query AssetPrice($assetId: String!) {
    asset_price(
      where: { asset_id: { _eq: $assetId } }
      order_by: { created_at: desc }
      limit: 1
    ) {
      ...AssetPriceFragment
    }
  }
`,
  [AssetPriceFragment]
);

export async function getAssetPriceInUserCurrency(
  assetIdParam: string
): Promise<Price> {
  const assetId = getAddress(assetIdParam);

  const [{ asset_price }, userDetails] = await Promise.all([
    hasuraClient.request(AssetPrice, {
      assetId,
    }),
    getCurrentUserDetail(),
  ]);

  if (asset_price.length === 0) {
    return {
      amount: 0,
      currency: userDetails.currency,
    };
  }

  const validatedPrice = safeParse(AssetPriceSchema, asset_price[0]);
  const exchangeRate = await getExchangeRate(
    validatedPrice.currency,
    userDetails.currency
  );
  if (!exchangeRate) {
    throw new Error("Exchange rate not found");
  }

  return {
    amount: validatedPrice.amount * exchangeRate,
    currency: userDetails.currency,
  };
}

export const getAssetsPriceInUserCurrency = cache(
  async (assetIds: string[]): Promise<Map<string, Price>> => {
    const assetIdsWithoutDuplicates = Array.from(new Set(assetIds));
    const assetPrices = await Promise.all(
      assetIdsWithoutDuplicates.map(async (assetId) => {
        const price = await getAssetPriceInUserCurrency(assetId);
        return [assetId, price] as [string, Price];
      })
    );
    return new Map(assetPrices);
  }
);
