import { getTotalAssetPrice } from "@/lib/queries/asset-price/total-assets-price";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Widget } from "./widget";

export async function PriceWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const { totalPrice, currency } = await getTotalAssetPrice();
  const locale = await getLocale();

  return (
    <Widget
      label={t("price.label")}
      value={formatNumber(totalPrice, {
        locale,
        currency,
      })}
      subtext={t("price.subtext")}
    />
  );
}
