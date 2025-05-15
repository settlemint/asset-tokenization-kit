import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { theGraphClientKit, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress } from "viem";
import { getAssetsPricesInUserCurrency } from "./asset-price";

const TotalAssetSuplies = theGraphGraphql(
  `
  query TotalAssetSuplies {
    assets(where: {totalSupplyExact_gt: "0"}) {
      id
      totalSupply
    }
  }
`
);

const TotalAssetSupliesSchema = t.Object(
  {
    id: t.String({
      description: "The id of the asset",
    }),
    totalSupply: t.BigDecimal({
      description:
        "The total supply of the token in a human-readable decimal format",
    }),
  },
  {
    description: "The total supply of an asset",
  }
);

export const AssetPriceSchema = t.Object(
  {
    asset_id: t.EthereumAddress({
      description: "The id of the asset",
    }),
    amount: t.Number({
      description: "The amount of the price",
    }),
    currency: t.FiatCurrency({
      description: "The currency of the price",
    }),
  },
  {
    description: "The price of an asset",
  }
);

/**
 * Gets the total price across all assets in the user's preferred currency
 *
 * This function fetches all asset types, then calculates their total value in the user's
 * preferred currency.
 */
export const getTotalAssetPrice = withTracing(
  "queries",
  "getTotalAssetPrice",
  cache(async (userCurrency: CurrencyCode) => {
    "use cache";
    cacheTag("asset");
    const totalAssetSupliesData = await Promise.all([
      (async () => {
        const response = await theGraphClientKit.request(
          TotalAssetSuplies,
          {},
          {
            "X-GraphQL-Operation-Name": "TotalAssetSuplies",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        return safeParse(t.Array(TotalAssetSupliesSchema), response.assets);
      })(),
    ]);
    const totalAssetSuplies = totalAssetSupliesData.flat();
    const pricesInUserCurrency = await getAssetsPricesInUserCurrency(
      totalAssetSuplies.map((asset) => getAddress(asset.id)),
      userCurrency
    );

    const totalPrice = totalAssetSuplies.reduce((acc, asset) => {
      return (
        acc +
        (pricesInUserCurrency.get(getAddress(asset.id))?.amount ?? 0) *
          asset.totalSupply
      );
    }, 0);

    return {
      totalPrice,
    };
  })
);
