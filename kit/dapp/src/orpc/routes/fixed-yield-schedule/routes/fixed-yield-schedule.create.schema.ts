import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { basisPoints } from "@atk/zod/basis-points";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { isoCountryCodeNumeric } from "@atk/zod/iso-country-code";
import { timeInterval } from "@atk/zod/time-interval";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * Input schema for creating a fixed yield schedule.
 *
 * This schema validates the request parameters for creating a new fixed yield schedule
 * contract, ensuring all required configuration is provided with proper validation.
 *
 * @property {string} yieldRate - The yield rate in basis points (1% = 100)
 * @property {string} paymentInterval - The payment interval (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
 * @property {string} startTime - The start time for yield payments as Unix timestamp
 * @property {string} endTime - The end time for yield payments as Unix timestamp
 * @property {string} token - The token contract address that will use this yield schedule
 * @property {number} countryCode - ISO 3166-1 numeric country code for jurisdiction
 * @property {Object} walletVerification - Wallet verification details for transaction signing
 */
export const FixedYieldScheduleCreateInputSchema = MutationInputSchema.extend({
  yieldRate: basisPoints().describe(
    "The yield rate in basis points (1% = 100)"
  ),
  paymentInterval: z
    .union([
      timeInterval().describe(
        "The payment interval (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)"
      ),
      z.int().describe("The payment interval in seconds"),
    ])
    .describe("The payment interval"),
  startTime: timestamp().describe(
    "The start time for yield payments as Unix timestamp"
  ),
  endTime: timestamp().describe(
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
 * Type representing the validated fixed yield schedule create input.
 * Ensures type safety for request parameters.
 */
export type FixedYieldScheduleCreateInput = z.infer<
  typeof FixedYieldScheduleCreateInputSchema
>;
