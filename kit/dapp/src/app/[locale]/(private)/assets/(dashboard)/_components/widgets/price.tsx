import { getTotalAssetPrice } from "@/lib/queries/asset-price/total-assets-price";
import { getLocale, getTranslations } from "next-intl/server";
import { renderCompactNumber } from "../utils/format-compact";
import { Widget } from "./widget";

export async function PriceWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const { totalPrice, currency } = await getTotalAssetPrice();
  const locale = await getLocale();

  // Use the dashboard-specific formatter to get a compact display with full value
  const displayValue = renderCompactNumber({
    value: totalPrice,
    locale,
    currency,
  });

  return (
    <Widget
      label={t("price.label")}
      value={displayValue}
      subtext={t("price.subtext")}
    />
  );
}
