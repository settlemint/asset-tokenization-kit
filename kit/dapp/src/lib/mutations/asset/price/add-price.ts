import { hasuraGraphql } from "@/lib/settlemint/hasura";

export const AddAssetPrice = hasuraGraphql(`
  mutation AddAssetPrice($assetId: String!, $amount: numeric, $currency: currency) {
    insert_asset_price_one(object: {asset_id: $assetId, amount: $amount, currency: $currency}) {
      id
    }
  }
`);
