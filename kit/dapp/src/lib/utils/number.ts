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
  /** Whether to adjust the value by dividing by 10^decimals (for token amounts) */
  readonly adjustDecimals?: boolean;
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
  const {
    currency,
    token,
    decimals = 2,
    percentage = false,
    adjustDecimals = false,
  } = options;

  // Convert input to BigNumber safely and adjust for decimals if needed
  const value = (() => {
    try {
      let value: BigNumber;
      if (amount instanceof BigNumber) value = amount;
      else if (amount === null || amount === undefined)
        value = new BigNumber(0);
      else
        value = new BigNumber(
          typeof amount === "bigint" ? amount.toString() : amount
        );

      // Adjust for token decimals if needed (divide by 10^decimals)
      return adjustDecimals && decimals
        ? value.div(new BigNumber(10).pow(decimals))
        : value;
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

  const style = percentage ? "percent" : currency ? "currency" : "decimal";
  let formattedNumber = formatter.number(numberValue, {
    style,
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

  if (style === "decimal") {
    formattedNumber = removeLeadingZerosAfterDecimalPoint(formattedNumber);
  }

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

function removeLeadingZerosAfterDecimalPoint(value: string) {
  const [integerPart, decimalPart] = value.split(".");
  if (!decimalPart) return value;

  const nonZeroIndex = decimalPart.search(/[1-9]/);
  if (nonZeroIndex === -1) return integerPart;
  const trimmedDecimalPart = decimalPart.slice(0, nonZeroIndex + 1);
  return `${integerPart}.${trimmedDecimalPart}`;
}
