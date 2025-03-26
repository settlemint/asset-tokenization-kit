import { hasuraGraphql } from "@/lib/settlemint/hasura";

export const AssetPriceFragment = hasuraGraphql(`
  fragment AssetPriceFragment on asset_price {
    id
    amount
    currency
  }
`);
