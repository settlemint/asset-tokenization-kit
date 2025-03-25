import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParse } from "@/lib/utils/typebox";
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

export async function getAssetPriceInUserCurrency(assetIdParam: string) {
  const assetId = getAddress(assetIdParam);
  const { asset_price } = await hasuraClient.request(AssetPrice, {
    assetId,
  });
  if (asset_price.length === 0) {
    return 0;
  }
  return safeParse(AssetPriceSchema, asset_price[0]);
}
