import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { isoCountryCodeNumeric } from "@atk/zod/iso-country-code";
import { z } from "zod";

/**
 * Input schema for creating a fixed yield schedule.
 *
 * This schema validates the request parameters for creating a new fixed yield schedule
 * contract, ensuring all required configuration is provided with proper validation.
 *
 * @property {string} yieldRate - The yield rate in basis points (1% = 100)
 * @property {string} paymentInterval - The payment interval in seconds
 * @property {string} startTime - The start time for yield payments as Unix timestamp
 * @property {string} endTime - The end time for yield payments as Unix timestamp
 * @property {string} token - The token contract address that will use this yield schedule
 * @property {number} countryCode - ISO 3166-1 numeric country code for jurisdiction
 * @property {Object} walletVerification - Wallet verification details for transaction signing
 */
export const FixedYieldScheduleCreateInputSchema = MutationInputSchema.extend({
  yieldRate: apiBigInt.describe("The yield rate in basis points (1% = 100)"),
  paymentInterval: apiBigInt.describe(
    "The payment interval in seconds (e.g., 86400 for daily)"
  ),
  startTime: apiBigInt.describe(
    "The start time for yield payments as Unix timestamp"
  ),
  endTime: apiBigInt.describe(
    "The end time for yield payments as Unix timestamp"
  ),
  token: ethereumAddress.describe(
    "The token contract address that will use this yield schedule"
  ),
  countryCode: isoCountryCodeNumeric.describe(
    "ISO 3166-1 numeric country code for jurisdiction"
  ),
});

/**
 * Output schema for fixed yield schedule creation.
 *
 * This schema defines the structure of the response returned when
 * creating a fixed yield schedule, providing the contract address
 * of the newly deployed yield schedule.
 *
 * @property {string} address - The deployed yield schedule contract address
 */
export const FixedYieldScheduleCreateOutputSchema = z.object({
  address: ethereumAddress.describe(
    "The deployed yield schedule contract address"
  ),
});

/**
 * Type representing the validated fixed yield schedule create input.
 * Ensures type safety for request parameters.
 */
export type FixedYieldScheduleCreateInput = z.infer<
  typeof FixedYieldScheduleCreateInputSchema
>;

/**
 * Type representing the validated fixed yield schedule create response.
 * Ensures type safety for response data structure.
 */
export type FixedYieldScheduleCreateOutput = z.infer<
  typeof FixedYieldScheduleCreateOutputSchema
>;
