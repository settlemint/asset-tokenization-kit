/**
 * Extended Zod validation utilities
 *
 * This module provides custom Zod validators for blockchain and financial data types.
 * It extends the standard Zod library with specialized validators for Ethereum addresses,
 * transaction hashes, financial identifiers, and other domain-specific data types.
 */
import { BigNumber } from "bignumber.js";
import { fromUnixTime } from "date-fns";
import type { Address, Hash } from "viem";
import { getAddress, isAddress, isHash } from "viem";
import { z } from "zod";
import { fiatCurrencies } from "./typebox/fiat-currency";

/**
 * Safely parses data with a Zod schema and provides standardized error logging
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param context - Optional context information for error logging (e.g., 'user', 'asset', etc.)
 * @returns The validated and parsed data
 * @throws Original Zod error if validation fails
 */
export function safeParseWithLogging<Output, Input, Def extends z.ZodTypeDef>(
  schema: z.ZodType<Output, Def, Input>,
  data: unknown,
  context = "data"
): Output {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`🔴 Zod validation error for ${context}:`);

      // Format and log each issue in a readable way
      error.errors.forEach((issue, index) => {
        const path = issue.path.length ? issue.path.join(".") : "(root)";
        const code = issue.code;
        const message = issue.message;

        console.error(`  Error ${index + 1}:`);
        console.error(`    Path: ${path}`);
        console.error(`    Code: ${code}`);
        console.error(`    Message: ${message}`);

        // Add extra details based on the issue type
        if (code === "invalid_type") {
          const typedIssue = issue as z.ZodInvalidTypeIssue;
          console.error(`    Expected: ${typedIssue.expected}`);
          console.error(`    Received: ${typedIssue.received}`);
        }

        // Log additional context for specific error types
        if ("minimum" in issue) {
          console.error(`    Minimum: ${issue.minimum}`);
        }

        if ("maximum" in issue) {
          console.error(`    Maximum: ${issue.maximum}`);
        }

        if ("validation" in issue) {
          console.error(`    Validation: ${(issue as any).validation}`);
        }
      });

      // Pretty print the failed data
      console.error(
        `Failed ${context} data:`,
        typeof data === "object" ? JSON.stringify(data, null, 2) : data
      );
    } else {
      console.error(`Unknown error validating ${context}:`, error);
      console.error(`Failed ${context} data:`, data);
    }

    throw error; // Re-throw to maintain original behavior
  }
}

export function safeParseTransactionHash(
  transactionHashes: (string | undefined | null)[]
) {
  return safeParseWithLogging(extendedZod.hashes(), transactionHashes);
}

export const equityClasses = [
  "COMMON_EQUITY",
  "PREFERRED_EQUITY",
  "MARKET_CAPITALIZATION_EQUITY",
  "GEOGRAPHIC_EQUITY",
  "SECTOR_INDUSTRY_EQUITY",
  "INVESTMENT_STYLE_EQUITY",
  "INVESTMENT_STAGE_PRIVATE_EQUITY",
  "SPECIAL_CLASSES_EQUITY",
] as const;

export const equityCategories = [
  "COMMON_EQUITY",
  "VOTING_COMMON_STOCK",
  "NON_VOTING_COMMON_STOCK",
  "CUMULATIVE_PREFERRED_STOCK",
  "NON_CUMULATIVE_PREFERRED_STOCK",
  "CONVERTIBLE_PREFERRED_STOCK",
  "REDEEMABLE_PREFERRED_STOCK",
  "LARGE_CAP_EQUITY",
  "MID_CAP_EQUITY",
  "SMALL_CAP_EQUITY",
  "MICRO_CAP_EQUITY",
  "DOMESTIC_EQUITY",
  "INTERNATIONAL_EQUITY",
  "GLOBAL_EQUITY",
  "EMERGING_MARKET_EQUITY",
  "FRONTIER_MARKET_EQUITY",
  "TECHNOLOGY",
  "FINANCIALS",
  "HEALTHCARE",
  "ENERGY",
  "CONSUMER_STAPLES",
  "CONSUMER_DISCRETIONARY",
  "INDUSTRIALS",
  "MATERIALS",
  "UTILITIES",
  "COMMUNICATION_SERVICES",
  "REAL_ESTATE",
  "GROWTH_EQUITY",
  "VALUE_EQUITY",
  "BLEND_EQUITY",
  "INCOME_EQUITY",
  "VENTURE_CAPITAL",
  "GROWTH_CAPITAL",
  "LEVERAGED_BUYOUTS",
  "MEZZANINE_FINANCING",
  "DISTRESSED_EQUITY",
  "RESTRICTED_STOCK",
  "ESOP_SHARES",
  "TRACKING_STOCKS",
  "DUAL_CLASS_SHARES",
] as const;

export const fundCategories = [
  "ACTIVIST",
  "COMMODITY_TRADING",
  "CONVERTIBLE_ARBITRAGE",
  "CREDIT",
  "CURRENCY_FX",
  "DISTRESSED_DEBT",
  "EMERGING_MARKETS",
  "EQUITY_HEDGE",
  "EVENT_DRIVEN",
  "FIXED_INCOME_ARBITRAGE",
  "FUND_OF_FUNDS",
  "GLOBAL_MACRO",
  "HIGH_FREQUENCY_TRADING",
  "MANAGED_FUTURES_CTA",
  "MARKET_NEUTRAL",
  "MERGER_ARBITRAGE",
  "MULTI_STRATEGY",
  "PRIVATE_EQUITY",
  "VENTURE_CAPITAL",
] as const;

export const fundClasses = [
  "ABSOLUTE_RETURN",
  "CORE_BLEND",
  "DIVERSIFIED",
  "EARLY_STAGE",
  "FACTOR_BASED",
  "GROWTH_FOCUSED",
  "INCOME_FOCUSED",
  "LARGE_CAP",
  "LONG_EQUITY",
  "LONG_SHORT_EQUITY",
  "MARKET_NEUTRAL",
  "MID_CAP",
  "MOMENTUM_ORIENTED",
  "OPPORTUNISTIC",
  "PRE_SERIES_B",
  "QUANTITATIVE_ALGORITHMIC",
  "REGIONAL",
  "SECTOR_SPECIFIC",
  "SEED_PRE_SEED",
  "SERIES_B_LATE_STAGE",
  "SHORT_EQUITY",
  "SMALL_CAP",
  "TACTICAL_ASSET_ALLOCATION",
  "VALUE_FOCUSED",
] as const;

const assetTypes = [
  "bond",
  "cryptocurrency",
  "equity",
  "fund",
  "stablecoin",
  "tokenizeddeposit",
] as const;

export type AssetType = (typeof assetTypes)[number];

export const timeUnits = [
  "seconds",
  "hours",
  "days",
  "weeks",
  "months",
] as const;

export type TimeUnit = (typeof timeUnits)[number];

/**
 * Comprehensive error map for Zod validation errors
 *
 * This error map translates Zod validation errors into message keys that can be
 * used for i18n translations in the UI. It covers all standard Zod error types
 * and custom domain-specific validation errors.
 */
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  // Always return an object with a message property
  let message: string;

  switch (issue.code) {
    // Standard Zod error types
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        message = "required";
      } else if (issue.expected === "string") {
        message = "must_be_string";
      } else if (issue.expected === "number") {
        message = "must_be_number";
      } else if (issue.expected === "boolean") {
        message = "must_be_boolean";
      } else if (issue.expected === "date") {
        message = "must_be_date";
      } else if (issue.expected === "bigint") {
        message = "must_be_bigint";
      } else if (issue.expected === "array") {
        message = "must_be_array";
      } else if (issue.expected === "object") {
        message = "must_be_object";
      } else {
        message = `invalid_type`;
      }
      break;

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "url") {
        message = "invalid_url";
      } else if (issue.validation === "email") {
        message = "invalid_email";
      } else if (issue.validation === "uuid") {
        message = "invalid_uuid";
      } else if (issue.validation === "cuid") {
        message = "invalid_cuid";
      } else if (issue.validation === "regex") {
        message = "invalid_format";
      } else if (issue.validation === "datetime") {
        message = "invalid_datetime";
      } else {
        message = `invalid_string`;
      }
      break;

    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        if (issue.inclusive) {
          message = "string_length_too_small.inclusive";
        } else {
          message = "string_length_too_small.exclusive";
        }
      } else if (issue.type === "number") {
        if (issue.inclusive) {
          message = "number_too_small.inclusive";
        } else {
          message = "number_too_small.exclusive";
        }
      } else if (issue.type === "array") {
        if (issue.inclusive) {
          message = "array_length_too_small.inclusive";
        } else {
          message = "array_length_too_small.exclusive";
        }
      } else {
        message = "too_small";
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        if (issue.inclusive) {
          message = "string_length_too_big.inclusive";
        } else {
          message = "string_length_too_big.exclusive";
        }
      } else if (issue.type === "number") {
        if (issue.inclusive) {
          message = "number_too_big.inclusive";
        } else {
          message = "number_too_big.exclusive";
        }
      } else if (issue.type === "array") {
        if (issue.inclusive) {
          message = "array_length_too_big.inclusive";
        } else {
          message = "array_length_too_big.exclusive";
        }
      } else {
        message = "too_big";
      }
      break;

    case z.ZodIssueCode.invalid_literal:
      message = "invalid_literal";
      break;

    case z.ZodIssueCode.invalid_union:
      message = "invalid_union";
      break;

    case z.ZodIssueCode.invalid_union_discriminator:
      message = "invalid_union_discriminator";
      break;

    case z.ZodIssueCode.invalid_enum_value:
      message = "invalid_enum_value";
      break;

    case z.ZodIssueCode.invalid_arguments:
      message = "invalid_arguments";
      break;

    case z.ZodIssueCode.invalid_return_type:
      message = "invalid_return_type";
      break;

    case z.ZodIssueCode.invalid_date:
      message = "invalid_date";
      break;

    case z.ZodIssueCode.custom:
      // For custom validators, prioritize existing message or use a default
      if (issue.message) {
        // Already contains one of our custom keys like "invalid-ethereum-address"
        message = issue.message;
      } else {
        message = "validation_failed";
      }
      break;

    // Default fallback
    default:
      message = ctx.defaultError;
      break;
  }

  return { message };
};

z.setErrorMap(customErrorMap);

// Create a custom extension of Zod
// This approach avoids TypeScript errors with namespace merging
const extendedZod = {
  ...z,
  /**
   * Validates and normalizes an Ethereum address
   *
   * @returns A Zod schema that validates Ethereum addresses and transforms them to checksummed format
   */
  address: () =>
    z
      .string()
      .refine((val) => isAddress(val), {
        message: "invalid-ethereum-address",
      })
      .transform((val): Address => getAddress(val)),

  /**
   * Validates an Ethereum transaction or block hash
   *
   * @returns A Zod schema that validates Ethereum hashes
   */
  hash: () =>
    z
      .string()
      .refine((val) => isHash(val), {
        message: "invalid-hash-format",
      })
      .transform((val): Hash => val),

  /**
   * Validates an array of Ethereum hashes
   *
   * @returns A Zod schema that validates an array of Ethereum hashes
   */
  hashes: function () {
    return z.array(this.hash());
  },

  /**
   * Validates a 6-digit pincode
   *
   * @returns A Zod schema that validates 6-digit pincodes
   */
  pincode: () =>
    z
      .number()
      .or(z.string())
      .pipe(
        z.coerce
          .number()
          .min(100000, { message: "invalid-pincode" })
          .max(999999, { message: "invalid-pincode" })
      ),

  /**
   * Validates token decimals (0-18)
   *
   * @returns A Zod schema that validates token decimal places with a default of 18
   */
  decimals: () =>
    z
      .number()
      .or(z.string())
      .pipe(
        z.coerce
          .number()
          .min(0, { message: "decimals-min" })
          .max(18, { message: "decimals-max" })
          .default(18)
      ),

  /**
   * Validates a positive amount (minimum 1)
   *
   * @returns A Zod schema that validates positive amounts
   */
  amount: (max?: number, decimals?: number) => {
    const smallestPossibleValue = decimals ? Math.pow(10, -decimals) : 1;

    return z
      .number()
      .or(z.string())
      .pipe(
        z.coerce
          .number()
          .min(smallestPossibleValue, {
            message: "amount-too-small",
          })
          .max(max ?? Infinity, {
            message: "amount-too-large",
          })
      );
  },
  /**
   * Validates user roles selection
   *
   * Ensures at least one role is selected from the available options.
   *
   * @returns A Zod schema that validates user role selections
   */
  roles: () =>
    z
      .object({
        DEFAULT_ADMIN_ROLE: z.boolean().nullish(),
        SUPPLY_MANAGEMENT_ROLE: z.boolean().nullish(),
        USER_MANAGEMENT_ROLE: z.boolean().nullish(),
      })
      .refine((data) => Object.values(data).some(Boolean), {
        message: "role-required",
      }),

  /**
   * Validates a token symbol
   *
   * Ensures the symbol contains only uppercase letters.
   *
   * @returns A Zod schema that validates token symbols
   */
  symbol: () =>
    z
      .string()
      .nonempty()
      .regex(/^[A-Z0-9]+$/, {
        message: "invalid-symbol",
      }),
  /**
   * Validates an International Securities Identification Number (ISIN)
   *
   * Ensures the ISIN is exactly 12 characters long and contains only uppercase letters and numbers.
   *
   * @returns A Zod schema that validates ISIN codes
   */
  isin: () =>
    z
      .string()
      .refine((val) => val === "" || /^[A-Z0-9]+$/.test(val), {
        message: "isin-format",
      })
      .refine((val) => val === "" || val.length === 12, {
        message: "isin-length",
      }),

  /**
   * Validates and transforms a string/number to a BigInt
   *
   * @returns A Zod schema that validates and transforms a string to a BigInt
   */
  bigInt: () =>
    z.number().or(z.string()).or(z.bigint()).pipe(z.coerce.bigint()),

  /**
   * Validates and transforms a string/number to a BigNumber
   *
   * This validator:
   * 1. Coerces the input to a string
   * 2. Validates it's a valid decimal number
   * 3. Converts it to a BigNumber for precise decimal handling
   * 4. Returns 0 if the result would be NaN or invalid
   *
   * @returns A Zod schema that validates and transforms a string to a BigNumber
   */
  bigDecimal: () =>
    z
      .number()
      .or(z.string())
      .pipe(
        z.coerce
          .string()
          .refine(
            (val) => {
              // Check if it's a valid decimal string
              return /^-?\d*\.?\d+$/.test(val);
            },
            { message: "invalid-decimal" }
          )
          .transform((val) => {
            try {
              const decimal = new BigNumber(val);
              // Check if it's a valid finite number and convert to normal decimal string
              return decimal.isFinite()
                ? Number(decimal.toFixed(6))
                : new BigNumber(0).toNumber();
            } catch {
              return new BigNumber(0).toNumber();
            }
          })
      ),

  /**
   * Validates and transforms a timestamp to a Date object
   *
   * Automatically detects the timestamp format (seconds, milliseconds, or microseconds)
   * and converts it to a JavaScript Date object using date-fns.
   *
   * - Unix timestamp (seconds): ~10 digits
   * - Milliseconds timestamp: ~13 digits
   * - Microseconds timestamp: ~16 digits
   *
   * @returns A Zod schema that validates timestamps and transforms them to Date objects
   */
  timestamp: () =>
    z.coerce
      .number()
      .min(0, { message: "invalid-timestamp" })
      .transform((val) => {
        // Detect timestamp format based on the number of digits
        // Unix timestamp (seconds): ~10 digits
        // Milliseconds timestamp: ~13 digits
        // Microseconds timestamp: ~16 digits
        const digits = Math.floor(Math.log10(val)) + 1;

        let seconds: number;

        if (digits <= 10) {
          // Unix timestamp (seconds)
          seconds = val;
        } else if (digits <= 13) {
          // Milliseconds timestamp
          seconds = val / 1000;
        } else {
          // Microseconds timestamp
          seconds = val / 1000000;
        }

        return fromUnixTime(seconds);
      }),

  /**
   * Validates an asset type
   *
   * @returns A Zod schema that validates asset types
   */
  assetType: () => z.enum(assetTypes),

  /**
   * Validates an equity category
   *
   * @returns A Zod schema that validates equity categories
   */
  equityCategory: () => z.enum(equityCategories),

  /**
   * Validates an equity class
   *
   * @returns A Zod schema that validates equity classes
   */
  equityClass: () => z.enum(equityClasses),

  /**
   * Validates a fund category
   *
   * @returns A Zod schema that validates fund categories
   */
  fundCategory: () => z.enum(fundCategories),

  /**
   * Validates a fund class
   *
   * @returns A Zod schema that validates fund classes
   */
  fundClass: () => z.enum(fundClasses),

  /**
   * Validates a value in base currency
   *
   * @returns A Zod schema that validates a value in base currency
   */
  fiatCurrency: () => z.enum(fiatCurrencies),

  /**
   * Validates a currency amount with proper decimal handling
   *
   * @returns A Zod schema that validates currency amounts
   */
  fiatCurrencyAmount: () =>
    z
      .number()
      .or(z.string())
      .transform((val) => (val === null || val === undefined ? 0 : val))
      .pipe(z.coerce.number().min(0, { message: "negative-amount" })),

  /**
   * Validates time units for duration inputs
   *
   * @returns A Zod schema that validates time units
   */
  timeUnit: () => z.enum(timeUnits),
};

/**
 * Extended Zod object with custom validators for blockchain and financial data types
 */
export { extendedZod as z };

/**
 * Type utility for inferring the type of a Zod schema
 */
export type { infer as ZodInfer } from "zod";
export type ZodType = z.ZodType<any, any, any>;
