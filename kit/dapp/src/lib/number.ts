/**
 * Options for currency formatting
 */
interface CurrencyFormatOptions {
  currency: string;
  locale?: Intl.LocalesArgument;
}

/**
 * Options for token value formatting
 */
interface TokenFormatOptions {
  decimals: number;
  locale?: Intl.LocalesArgument;
}

/**
 * Options for percentage formatting
 */
interface PercentageFormatOptions {
  locale?: Intl.LocalesArgument;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const LARGE_NUMBER_UNITS = [
  '',
  'Thousand',
  'Million',
  'Billion',
  'Trillion',
  'Quadrillion',
  'Quintillion',
  'Sextillion',
  'Septillion',
  'Octillion',
  'Nonillion',
  'Decillion',
  'Undecillion',
  'Duodecillion',
  'Tredecillion',
  'Quattuordecillion',
  'Quindecillion',
  'Sexdecillion',
  'Septendecillion',
  'Octodecillion',
  'Novemdecillion',
  'Vigintillion',
] as const;

type LargeNumberUnit = (typeof LARGE_NUMBER_UNITS)[number];

/**
 * Formats a number as currency with the specified options
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, options: CurrencyFormatOptions): string {
  const { currency, locale } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(amount);
}

/**
 * Formats a token value with a specified number of decimal places
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted token value string
 */
export function formatTokenValue(amount: number | bigint, options: TokenFormatOptions): string {
  const { decimals, locale } = options;
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Result type for percentage formatting
 */
interface FormatPercentageResult {
  success: boolean;
  value: string;
  error?: string;
}

/**
 * Formats a number or string as a percentage
 * @param amount - The amount to format as a percentage
 * @param options - Formatting options
 * @returns Object containing the formatted percentage or error
 */
export function formatPercentage(
  amount: number | bigint | string,
  options: PercentageFormatOptions = {}
): FormatPercentageResult {
  try {
    const numericValue = Number.parseFloat(amount.toString());
    if (Number.isNaN(numericValue)) {
      return { success: false, value: '0%', error: 'Invalid number format' };
    }

    const dividedValue = numericValue / 100;
    const { locale, minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

    const formatted = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(dividedValue);

    return { success: true, value: formatted };
  } catch (error) {
    return {
      success: false,
      value: '0%',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Options for large number formatting
 */
interface FormatLargeNumberResult {
  value: string;
  unit: LargeNumberUnit;
}

/**
 * Formats a large number into a more readable string with units
 * @param value - The number to format
 * @returns Object containing the formatted value and unit used
 * @throws {Error} If the input cannot be converted to a number
 */
export function formatLargeNumber(value: string | number | bigint): FormatLargeNumberResult {
  const bigIntValue = BigInt(Math.floor(Number(value)));
  const divisor = BigInt(1000);

  let unitIndex = 0;
  let scaledValue = bigIntValue;

  while (scaledValue >= divisor && unitIndex < LARGE_NUMBER_UNITS.length - 1) {
    scaledValue /= divisor;
    unitIndex++;
  }

  return {
    value: scaledValue.toString(),
    unit: LARGE_NUMBER_UNITS[unitIndex],
  };
}
