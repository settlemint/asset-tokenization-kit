import { hasuraGraphql } from "@/lib/settlemint/hasura";
import type { FragmentOf } from "@settlemint/sdk-hasura";

export const AssetPriceFragment = hasuraGraphql(`
  fragment AssetPriceFragment on asset_price {
    id
    amount
    currency
    asset_id
  }
`);

export type AssetPrice = FragmentOf<typeof AssetPriceFragment>;
