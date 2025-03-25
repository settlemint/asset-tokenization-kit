import { getUser } from "@/lib/auth/utils";
import { getExchangeRate } from "@/lib/providers/exchange-rates/exchange-rates";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParse } from "@/lib/utils/typebox";
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

export async function getAssetPriceInUserCurrency(assetId: string) {
  const { asset_price } = await hasuraClient.request(AssetPrice, {
    assetId,
  });
  const validatedAssetPrice = safeParse(AssetPriceSchema, asset_price);

  const user = await getUser();
  const userDetails = await getUserDetail({ id: user.id });
  const userCurrency = userDetails?.currency;

  const exchangeRate = await getExchangeRate(
    validatedAssetPrice.currency,
    userCurrency
  );
  if (!exchangeRate) {
    throw new Error("Exchange rate not found");
  }

  return validatedAssetPrice.amount * exchangeRate;
}
