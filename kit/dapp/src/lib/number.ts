import BigNumber from 'bignumber.js';

BigNumber.config({
  DECIMAL_PLACES: 6,
});

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
  amount?: string | bigint | number | BigNumber | null,
  options: FormatOptions = {}
): string {
  const { currency, token, locale = 'en-US', decimals = 2, percentage = false } = options;
  let value = new BigNumber(amount?.toString() ?? '0');

  if (value.isNaN()) {
    value = new BigNumber(0);
  }

  if (percentage) {
    let percentageValue = new BigNumber(0);
    if (!value.isZero()) {
      percentageValue = value.dividedBy(100);
    }

    return new Intl.NumberFormat(locale, {
      style: value.isFinite() ? 'percent' : undefined,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(percentageValue.toNumber());
  }

  const number = new Intl.NumberFormat(locale, {
    style: currency ? 'currency' : 'decimal',
    currency,
    currencyDisplay: currency ? 'symbol' : undefined,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value.toNumber());

  if (token) {
    return `${number} ${token}`;
  }

  return number;
}
