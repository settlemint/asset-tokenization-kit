import { getTotalAssetPrice } from "@/lib/queries/asset-price/total-assets-price";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Widget } from "./widget";

export async function PriceWidget() {
  const t = await getTranslations("admin.dashboard.widgets");
  const { totalPrice, currency } = await getTotalAssetPrice();
  const locale = await getLocale();

  const formattedValue = formatNumber(totalPrice, {
    locale,
    currency,
    compact: true,
    showFullValue: true,
  });

  const displayValue =
    typeof formattedValue === "string" ? (
      formattedValue
    ) : (
      <div>
        <span>{formattedValue.compactValue}</span>
        <div className="text-xs text-muted-foreground">
          ({formattedValue.fullValue})
        </div>
      </div>
    );

  return (
    <Widget
      label={t("price.label")}
      value={displayValue}
      subtext={t("price.subtext")}
    />
  );
}
