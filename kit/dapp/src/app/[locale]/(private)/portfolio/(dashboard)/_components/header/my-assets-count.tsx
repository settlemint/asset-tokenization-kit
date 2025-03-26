import { formatNumber } from "@/lib/utils/number";
import type { Price } from "@/lib/utils/typebox/price";
import { useLocale, useTranslations } from "next-intl";

export function MyAssetsCount({
  totalCount,
  totalValue,
}: {
  totalCount: string;
  totalValue: Price;
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale();

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">
          {formatNumber(totalValue.amount, {
            locale,
            currency: totalValue.currency,
          })}
        </span>
      </div>
    </div>
  );
}
