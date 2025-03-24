import { BigNumber } from "bignumber.js";
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
): string {
  const { currency, token, decimals = 2, percentage = false } = options;

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

    return token ? `< ${minFormatted} ${token}` : `< ${minFormatted}`;
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
): string {
  const formatter = createFormatter({
    locale: options.locale?.toString() || "en",
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
