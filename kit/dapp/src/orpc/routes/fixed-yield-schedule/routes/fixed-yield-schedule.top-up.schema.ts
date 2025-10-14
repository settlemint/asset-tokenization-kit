import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import * as z from "zod";

/**
 * Input schema for topping up denomination asset in a fixed yield schedule.
 *
 * This schema validates the request parameters for topping up the denomination asset
 * in an existing fixed yield schedule contract, ensuring proper validation of the
 * amount and contract address.
 *
 * @property {string} contract - The fixed yield schedule contract address
 * @property {string} amount - The amount of denomination asset to top up
 * @property {Object} walletVerification - Wallet verification details for transaction signing
 */
export const FixedYieldScheduleTopUpInputSchema =
  MutationInputSchemaWithContract.extend({
    amount: apiBigInt.describe("The amount of denomination asset to top up"),
  });

/**
 * Output schema for fixed yield schedule top up operation.
 *
 * This schema defines the structure of the response returned when
 * topping up the denomination asset in a fixed yield schedule,
 * providing the transaction hash of the operation.
 *
 * @property {string} transactionHash - The transaction hash of the top up operation
 */
export const FixedYieldScheduleTopUpOutputSchema = z.object({
  transactionHash: z
    .string()
    .describe("The transaction hash of the top up operation"),
});

/**
 * Type representing the validated fixed yield schedule top up input.
 * Ensures type safety for request parameters.
 */
export type FixedYieldScheduleTopUpInput = z.infer<
  typeof FixedYieldScheduleTopUpInputSchema
>;

/**
 * Type representing the validated fixed yield schedule top up response.
 * Ensures type safety for response data structure.
 */
export type FixedYieldScheduleTopUpOutput = z.infer<
  typeof FixedYieldScheduleTopUpOutputSchema
>;
