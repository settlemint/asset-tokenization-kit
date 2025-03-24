import { getTotalAssetPrice } from "@/lib/queries/asset-price/asset-price";
import { Widget } from "./widget";

export async function PriceWidget() {
  const { totalPrice, currency } = await getTotalAssetPrice();

  return (
    <Widget
      label="Total value"
      value={totalPrice.toString()}
      subtext={`Total price in ${currency}`}
    />
  );
}
