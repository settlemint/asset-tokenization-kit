import { FormatValueProps } from "@/lib/utils/format-value/types";
import { format as formatDnum, isDnum } from "dnum";
import { useTranslation } from "react-i18next";
import { safeToNumber } from "./safe-to-number";

export function FormatPercentage({ value }: FormatValueProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  // Check if value is a Dnum (big decimal) first
  if (isDnum(value)) {
    // Format Dnum with locale-aware formatting
    const formatted = formatDnum(value, {
      locale,
      trailingZeros: false,
    });

    return <span className="block tabular-nums">{formatted}%</span>;
  }

  // Use safe number conversion to handle large values without precision loss
  const percentageValue = safeToNumber(value);

  // Format with proper locale
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(percentageValue);

  return <span className="block tabular-nums">{formatted}%</span>;
}
