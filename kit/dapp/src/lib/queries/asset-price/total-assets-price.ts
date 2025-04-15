import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphClientKit, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress } from "viem";

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

const TotalAssetPrices = hasuraGraphql(
  `
  query TotalAssetPrices {
    asset_price {
      asset_id
      amount
      currency
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
  cache(async () => {
    "use cache";
    cacheTag("asset");

    const [totalAssetSuplies, totalAssetPrices] = await Promise.all([
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
      (async () => {
        const response = await hasuraClient.request(
          TotalAssetPrices,
          {},
          {
            "X-GraphQL-Operation-Name": "TotalAssetPrices",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        return safeParse(t.Array(AssetPriceSchema), response.asset_price);
      })(),
    ]);

    const totalAssetPricesById = new Map(
      totalAssetPrices.map((asset) => [getAddress(asset.asset_id), asset])
    );

    const totalPrice = totalAssetSuplies.reduce((acc, asset) => {
      return (
        acc +
        (totalAssetPricesById.get(getAddress(asset.id))?.amount ?? 0) *
          asset.totalSupply
      );
    }, 0);

    return {
      totalPrice,
    };
  })
);
