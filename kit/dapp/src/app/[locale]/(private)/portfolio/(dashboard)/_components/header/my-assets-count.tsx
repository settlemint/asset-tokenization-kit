import { renderCompactNumber } from "@/app/[locale]/(private)/assets/(dashboard)/_components/utils/format-compact";
import type { Price } from "@/lib/utils/typebox/price";
import { useLocale } from "next-intl";

export function MyAssetsCount({ totalValue }: { totalValue: Price }) {
  const locale = useLocale();

  // Use the dashboard-specific formatter for compact display with full value
  const displayValue = renderCompactNumber({
    value: totalValue.amount,
    locale,
    currency: totalValue.currency,
  });

  return (
    <div className="flex items-center justify-between">
      <div className="font-bold text-4xl">{displayValue}</div>
    </div>
  );
}
