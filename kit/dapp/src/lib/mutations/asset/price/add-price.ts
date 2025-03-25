import { hasuraGraphql } from "@/lib/settlemint/hasura";

export const AddAssetPrice = hasuraGraphql(`
  mutation AddAssetPrice($id: String!, $amount: numeric, $currency: currency) {
    insert_asset_price_one(object: {id: $id, amount: $amount, currency: $currency}) {
      id
    }
  }
`);
