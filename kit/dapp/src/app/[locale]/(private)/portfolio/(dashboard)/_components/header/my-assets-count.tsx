import { formatNumber } from "@/lib/utils/number";
import type { Price } from "@/lib/utils/typebox/price";
import { useLocale, useTranslations } from "next-intl";

export function MyAssetsCount({
  total,
  price,
}: {
  total: string;
  price: Price;
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale();

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">
          {formatNumber(price.amount, { locale, currency: price.currency })}
        </span>
      </div>
    </div>
  );
}
