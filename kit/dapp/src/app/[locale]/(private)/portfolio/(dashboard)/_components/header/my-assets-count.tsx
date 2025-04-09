import { formatNumber } from "@/lib/utils/number";
import type { Price } from "@/lib/utils/typebox/price";
import { useLocale } from "next-intl";

export function MyAssetsCount({
  totalValue,
}: {
  totalCount: string;
  totalValue: Price;
}) {
  const locale = useLocale();

  const formattedValue = formatNumber(totalValue.amount, {
    locale,
    currency: totalValue.currency,
    compact: true,
    showFullValue: true,
  });

  return (
    <div className="flex items-center justify-between">
      <div>
        {typeof formattedValue === "string" ? (
          <span className="mr-1 font-bold text-4xl">{formattedValue}</span>
        ) : (
          <div>
            <span className="mr-1 font-bold text-4xl">
              {formattedValue.compactValue}
            </span>
            <div className="text-xs text-muted-foreground">
              ({formattedValue.fullValue})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
