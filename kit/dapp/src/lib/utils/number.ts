import { BigNumber } from "bignumber.js";

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
 */
export function formatNumber(
  amount?: string | bigint | number | BigNumber | null,
  options: FormatOptions = {}
): string {
  const {
    currency,
    token,
    locale = "en-US",
    decimals = 2,
    percentage = false,
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
  const formattedNumber = new Intl.NumberFormat(locale, {
    style: percentage ? "percent" : currency ? "currency" : "decimal",
    currency,
    currencyDisplay: currency ? "symbol" : undefined,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numberValue);

  // Check if the number is very small (less than the smallest displayable value based on decimals)
  const minimumValue = new BigNumber(1).div(10 ** decimals);
  if (
    value.isGreaterThan(0) &&
    value.isLessThan(percentage ? minimumValue : minimumValue)
  ) {
    const minFormatted = new Intl.NumberFormat(locale, {
      style: percentage ? "percent" : currency ? "currency" : "decimal",
      currency,
      currencyDisplay: currency ? "symbol" : undefined,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(percentage ? 0.0001 : minimumValue.toNumber());

    return token ? `< ${minFormatted} ${token}` : `< ${minFormatted}`;
  }

  return token ? `${formattedNumber} ${token}` : formattedNumber;
}
