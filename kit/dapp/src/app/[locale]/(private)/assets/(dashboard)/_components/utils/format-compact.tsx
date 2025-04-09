import type { CurrencyCode } from "@/lib/db/schema-settings";
import { formatNumber } from "@/lib/utils/number";
import type { Locale } from "next-intl";
import type { ReactNode } from "react";

export interface FormattedNumberWithFull {
  compactValue: string;
  fullValue: string;
}

interface CompactFormatOptions {
  /** The number to format */
  value: number;
  /** The locale to use for formatting */
  locale: Locale;
  /** The currency code to use (optional) */
  currency?: CurrencyCode;
  /** The token symbol to use (optional) */
  token?: string;
  /** The number of decimal places to display */
  decimals?: number;
}

/**
 * Formats a number in a compact way (K, M, B, T) and returns both the compact value
 * and the full value.
 */
export function formatCompact({
  value,
  locale,
  currency,
  token,
  decimals = 2,
}: CompactFormatOptions): FormattedNumberWithFull {
  // Generate the full formatted value using the standard formatter
  const fullValue = formatNumber(value, {
    locale,
    currency,
    token,
    decimals,
  });

  // Format the compact value
  const absValue = Math.abs(value);
  let formattedValue: string;
  let suffix = "";

  if (absValue >= 1e12) {
    formattedValue = (value / 1e12).toFixed(3);
    suffix = "T";
  } else if (absValue >= 1e9) {
    formattedValue = (value / 1e9).toFixed(3);
    suffix = "B";
  } else if (absValue >= 1e6) {
    formattedValue = (value / 1e6).toFixed(2);
    suffix = "M";
  } else if (absValue >= 1e3) {
    formattedValue = (value / 1e3).toFixed(2);
    suffix = "K";
  } else {
    formattedValue = value.toFixed(decimals);
  }

  // Don't remove trailing zeros to preserve detail
  let compactValue: string;

  if (currency) {
    // Get currency symbol
    const currencySymbol = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      currencyDisplay: "symbol",
    })
      .format(1)
      .replace(/[0-9.,]/g, "")
      .trim();

    compactValue = `${currencySymbol}${formattedValue}${suffix}`;
  } else {
    compactValue = token
      ? `${formattedValue}${suffix} ${token}`
      : `${formattedValue}${suffix}`;
  }

  return {
    compactValue,
    fullValue,
  };
}

/**
 * Helper function to render a compact number with full value underneath
 */
export function renderCompactNumber({
  value,
  locale,
  currency,
  token,
  decimals = 2,
}: CompactFormatOptions): ReactNode {
  // For very small numbers or non-compact-eligible values, just use normal formatting
  if (value < 1000) {
    return formatNumber(value, { locale, currency, token, decimals });
  }

  const { compactValue, fullValue } = formatCompact({
    value,
    locale,
    currency,
    token,
    decimals,
  });

  return (
    <div>
      <span>{compactValue}</span>
      <div className="text-xs text-muted-foreground">({fullValue})</div>
    </div>
  );
}
