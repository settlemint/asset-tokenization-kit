import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Input schema for withdrawing denomination asset from a fixed yield schedule.
 */
export const FixedYieldScheduleWithdrawInputSchema =
  MutationInputSchemaWithContract.extend({
    amount: apiBigInt.describe("The amount of denomination asset to withdraw"),
    to: ethereumAddress.describe(
      "The recipient address for the withdrawn denomination asset"
    ),
    tokenAddress: ethereumAddress.describe(
      "The token contract address that uses this yield schedule"
    ),
  });

/**
 * Output schema for fixed yield schedule withdraw operation.
 */
export const FixedYieldScheduleWithdrawOutputSchema = BaseMutationOutputSchema;

/**
 * Type representing the validated fixed yield schedule withdraw input.
 * Ensures type safety for request parameters.
 */
export type FixedYieldScheduleWithdrawInput = z.infer<
  typeof FixedYieldScheduleWithdrawInputSchema
>;

/**
 * Type representing the validated fixed yield schedule withdraw response.
 * Ensures type safety for response data structure.
 */
export type FixedYieldScheduleWithdrawOutput = z.infer<
  typeof FixedYieldScheduleWithdrawOutputSchema
>;
