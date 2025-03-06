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
    console.error(`Zod validation error for ${context}:`, error);
    console.error(`Failed ${context} data:`, data);
    throw error; // Re-throw to maintain original behavior
  }
}

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
        message: "Invalid Ethereum address format",
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
        message: "Invalid hash format",
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
    z.coerce
      .number()
      .min(100000, { message: "Invalid pincode" })
      .max(999999, { message: "Invalid pincode" }),

  /**
   * Validates token decimals (0-18)
   *
   * @returns A Zod schema that validates token decimal places with a default of 18
   */
  decimals: () =>
    z.coerce
      .number()
      .min(0, { message: "Must be at least 0" })
      .max(18, { message: "Must be between 0 and 18" })
      .default(18),

  /**
   * Validates a positive amount (minimum 1)
   *
   * @returns A Zod schema that validates positive amounts
   */
  amount: () => z.coerce.number().min(1, { message: "Must be at least 1" }),

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
        DEFAULT_ADMIN_ROLE: z.boolean(),
        SUPPLY_MANAGEMENT_ROLE: z.boolean(),
        USER_MANAGEMENT_ROLE: z.boolean(),
      })
      .refine((data) => Object.values(data).some(Boolean), {
        message: "At least one role must be selected",
      }),

  /**
   * Validates a token symbol
   *
   * Ensures the symbol contains only uppercase letters.
   *
   * @returns A Zod schema that validates token symbols
   */
  symbol: () =>
    z.string().regex(/^[A-Z0-9]+$/, {
      message: "Symbol must contain only uppercase letters and numbers",
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
        message: "ISIN must contain only uppercase letters and numbers",
      })
      .refine((val) => val === "" || val.length === 12, {
        message: "ISIN must be exactly 12 characters",
      }),

  /**
   * Validates and transforms a string to a BigInt
   *
   * @returns A Zod schema that validates and transforms a string to a BigInt
   */
  bigInt: () => z.coerce.bigint(),

  /**
   * Validates and transforms a string to a BigNumber
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
    z.coerce
      .string()
      .refine(
        (val) => {
          // Check if it's a valid decimal string
          return /^-?\d*\.?\d+$/.test(val);
        },
        { message: "Invalid decimal number format" }
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
      }),

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
      .min(0, { message: "Timestamp must be a positive number" })
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
  assetType: () =>
    z.enum(["bond", "cryptocurrency", "equity", "fund", "stablecoin"]),
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
