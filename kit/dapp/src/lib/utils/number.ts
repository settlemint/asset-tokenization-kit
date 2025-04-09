import BigNumber from "bignumber.js";
import { createFormatter, useFormatter, type Locale } from "next-intl";
import type { CurrencyCode } from "../db/schema-settings";

/**
 * Options for currency formatting
 */
export interface FormatOptions {
  /** The currency code (e.g., 'USD', 'EUR') */
  readonly currency?: CurrencyCode;
  /** The token symbol (e.g., 'USDC', 'USDT') */
  readonly token?: string;
  /** The locale to use for formatting (e.g., 'en-US') */
  readonly locale: Locale;
  /** The number of decimal places to display */
  readonly decimals?: number;
  /** Whether to display the number as a percentage */
  readonly percentage?: boolean;
  /** Whether to display the number in compact notation (K, M, B, T) */
  readonly compact?: boolean;
  /** Whether to include the full value when using compact notation */
  readonly showFullValue?: boolean;
}

export interface FormattedNumberWithFull {
  compactValue: string;
  fullValue: string;
}

/**
 * Internal helper to format numbers with a given formatter
 */
function formatNumberWithFormatter(
  formatter:
    | ReturnType<typeof useFormatter>
    | ReturnType<typeof createFormatter>,
  amount: string | bigint | number | BigNumber | null | undefined,
  options: FormatOptions
): string | FormattedNumberWithFull {
  const {
    currency,
    token,
    decimals = 2,
    percentage = false,
    compact = false,
    showFullValue = false,
  } = options;

  // Convert input to BigNumber safely
  const value = (() => {
    try {
      if (amount instanceof BigNumber) return amount;
      if (amount === null || amount === undefined) return new BigNumber(0);
      return new BigNumber(
        typeof amount === "bigint" ? amount.toString() : amount
      );
    } catch {
      return new BigNumber(0);
    }
  })();

  // Format number with appropriate options
  const numberValue = percentage ? value.div(100).toNumber() : value.toNumber();

  let fullFormattedNumber: string | undefined;
  if (compact && showFullValue) {
    fullFormattedNumber = formatter.number(numberValue, {
      style: percentage ? "percent" : currency ? "currency" : "decimal",
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });

    if (token) {
      fullFormattedNumber = `${fullFormattedNumber} ${token}`;
    }
  }

  // Check if the number is very small (less than the smallest displayable value based on decimals)
  const minimumValue = new BigNumber(1).div(10 ** decimals);
  if (
    value.isGreaterThan(0) &&
    value.isLessThan(percentage ? minimumValue : minimumValue)
  ) {
    const minFormatted = formatter.number(
      percentage ? 0.0001 : minimumValue.toNumber(),
      {
        style: percentage ? "percent" : currency ? "currency" : "decimal",
        currency,
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }
    );

    const compactValue = token
      ? `< ${minFormatted} ${token}`
      : `< ${minFormatted}`;

    if (compact && showFullValue && fullFormattedNumber) {
      return {
        compactValue,
        fullValue: fullFormattedNumber,
      };
    }

    return compactValue;
  }

  // Use compact notation for large numbers if requested
  if (compact && !percentage) {
    // Custom compact formatting logic for large numbers
    const absValue = Math.abs(numberValue);
    let formattedValue: string;
    let suffix = "";

    if (absValue >= 1e12) {
      formattedValue = (numberValue / 1e12).toFixed(3);
      suffix = "T";
    } else if (absValue >= 1e9) {
      formattedValue = (numberValue / 1e9).toFixed(3);
      suffix = "B";
    } else if (absValue >= 1e6) {
      formattedValue = (numberValue / 1e6).toFixed(2);
      suffix = "M";
    } else if (absValue >= 1e3) {
      formattedValue = (numberValue / 1e3).toFixed(2);
      suffix = "K";
    } else {
      formattedValue = numberValue.toFixed(decimals);
    }

    let compactValue: string;
    if (currency) {
      // Get currency symbol
      const currencySymbol = new Intl.NumberFormat(options.locale, {
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

    if (showFullValue && fullFormattedNumber) {
      return {
        compactValue,
        fullValue: fullFormattedNumber,
      };
    }

    return compactValue;
  }

  const formattedNumber = formatter.number(numberValue, {
    style: percentage ? "percent" : currency ? "currency" : "decimal",
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

  return token ? `${formattedNumber} ${token}` : formattedNumber;
}

/**
 * Server-side number formatting function
 * Can be used in Server Components or outside of the React component tree
 */
export function formatNumber(
  amount: string | bigint | number | BigNumber | null | undefined,
  options: FormatOptions
): string | FormattedNumberWithFull {
  const formatter = createFormatter({
    locale: options.locale || "en",
    formats: {
      number: {
        currency: {
          style: "currency",
          currency: options.currency || "USD",
        },
        percent: {
          style: "percent",
        },
      },
    },
  });

  return formatNumberWithFormatter(formatter, amount, options);
}
