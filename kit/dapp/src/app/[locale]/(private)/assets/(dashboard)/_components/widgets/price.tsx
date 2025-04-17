import { getUser } from "@/lib/auth/utils";
import { getTotalAssetPrice } from "@/lib/queries/asset-price/total-assets-price";
import { getLocale, getTranslations } from "next-intl/server";
import { renderCompactNumber } from "../utils/format-compact";
import { Widget } from "./widget";

export async function PriceWidget() {
  const [t, user, locale] = await Promise.all([
    getTranslations("admin.dashboard.widgets"),
    getUser(),
    getLocale(),
  ]);
  const { totalPrice } = await getTotalAssetPrice(user.currency);

  // Use the dashboard-specific formatter to get a compact display with full value
  const displayValue = renderCompactNumber({
    value: totalPrice,
    locale,
    currency: user.currency,
  });

  return (
    <Widget
      label={t("price.label")}
      value={displayValue}
      subtext={t("price.subtext")}
    />
  );
}
