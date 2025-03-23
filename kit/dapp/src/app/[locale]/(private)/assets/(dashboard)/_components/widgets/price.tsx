import { authClient } from "@/lib/auth/client";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import { getTotalAssetPrice } from "@/lib/queries/asset-price/asset-price";
import { Widget } from "./widget";

export async function PriceWidget() {
  const user = await authClient.getSession();
  const targetCurrency = user?.data?.user.currency as CurrencyCode;
  const totalPrice = await getTotalAssetPrice(targetCurrency);

  return (
    <Widget
      label="Total value"
      value={totalPrice.toString()}
      subtext={`Total price in ${targetCurrency}`}
    />
  );
}
