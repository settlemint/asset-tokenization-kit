import {
  FormatValueProps,
  type FormatValueOptions,
} from "@/lib/utils/format-value/types";
import { format as formatDnum, isDnum } from "dnum";
import { useTranslation } from "react-i18next";
import { safeToNumber } from "./safe-to-number";

export function FormatNumber({ value, options }: FormatValueProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const formatted = formatNumber(value, options, locale);

  return <div className="tabular-nums">{formatted}</div>;
}

export function formatNumber(
  value: unknown,
  options: FormatValueOptions,
  locale: string
) {
  const { displayName } = options;
  // Check if value is a Dnum (big decimal) first
  if (isDnum(value)) {
    // Format Dnum with locale-aware formatting
    const formatted = formatDnum(value, {
      locale,
      trailingZeros: false,
    });

    return formatted;
  }

  // Use safe number conversion to handle large values without precision loss
  // This will return 0 for NaN values
  const numberValue = safeToNumber(value);

  // Determine formatting based on column metadata
  let minimumFractionDigits = 0;
  let maximumFractionDigits = 2;

  // No decimals for "decimals" columns
  if (displayName?.toLowerCase().includes("decimal")) {
    minimumFractionDigits = 0;
    maximumFractionDigits = 0;
  }

  // Use compact notation for large numbers
  const useCompact =
    displayName?.toLowerCase().includes("count") && numberValue > 9999;

  // Format with proper locale
  const formatted = new Intl.NumberFormat(locale, {
    notation: useCompact ? "compact" : "standard",
    minimumFractionDigits,
    maximumFractionDigits,
    ...(useCompact && { maximumFractionDigits: 1 }),
  }).format(numberValue);

  return formatted;
}
