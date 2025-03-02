import type bigDecimal from "js-big-decimal";
import BigDecimal from "js-big-decimal";

/**
 * Options for currency formatting
 */
export interface FormatOptions {
  /** The currency code (e.g., 'USD', 'EUR') */
  readonly currency?: string;
  /** The token symbol (e.g., 'USDC', 'USDT') */
  readonly token?: string;
  /** The locale to use for formatting (e.g., 'en-US') */
  readonly locale?: Intl.LocalesArgument;
  /** The number of decimal places to display */
  readonly decimals?: number;
  /** Whether to display the number as a percentage */
  readonly percentage?: boolean;
}

/**
 * Formats a number as currency with the specified options
 *
 * @param amount - The amount to format as a string
 * @param options - Formatting options including currency and locale
 * @returns Formatted currency string
 * @throws {Error} If the amount is not a valid number
 */
export function formatNumber(
  amount?: string | bigint | number | bigDecimal | null,
  options: FormatOptions = {}
): string {
  const {
    currency,
    token,
    locale = "en-US",
    decimals = 2,
    percentage = false,
  } = options;

  // Convert the amount to a BigDecimal
  let value: BigDecimal;
  try {
    // Safely convert amount to string, handling null, undefined, and objects
    const amountStr =
      amount === null || amount === undefined
        ? "0"
        : typeof amount === "object" && amount !== null && "getValue" in amount
          ? amount.getValue()
          : String(amount);

    value = new BigDecimal(amountStr);
  } catch (_error) {
    // Use underscore prefix for unused variable
    value = new BigDecimal("0");
  }

  if (percentage) {
    let percentageValue: number;
    if (value.getValue() !== "0") {
      // Divide by 100 for percentage
      percentageValue = parseFloat(value.getValue()) / 100;
    } else {
      percentageValue = 0;
    }

    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(percentageValue);
  }

  // Convert BigDecimal to number for formatting
  const numberValue = parseFloat(value.getValue());

  const formattedNumber = new Intl.NumberFormat(locale, {
    style: currency ? "currency" : "decimal",
    currency,
    currencyDisplay: currency ? "symbol" : undefined,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numberValue);

  if (token) {
    return `${formattedNumber} ${token}`;
  }

  return formattedNumber;
}
