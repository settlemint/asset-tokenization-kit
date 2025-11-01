import {
  FormatValueProps,
  type FormatValueOptions,
} from "@/lib/utils/format-value/types";
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

  // Use safe number conversion to handle large values without precision loss
  // This will return 0 for NaN values. We need to convert Dnum to number first
  // to enable compact formatting, since dnum's formatter doesn't support compact notation.
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
    options.compact ||
    (displayName?.toLowerCase().includes("count") && numberValue > 9999);

  // Format with proper locale
  const formatted = new Intl.NumberFormat(locale, {
    notation: useCompact ? "compact" : "standard",
    minimumFractionDigits,
    maximumFractionDigits,
    ...(useCompact && { maximumFractionDigits: 1 }),
  }).format(numberValue);

  return formatted;
}
