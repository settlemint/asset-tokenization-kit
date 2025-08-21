import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import type { z } from "zod";

/**
 * Input schema for setting a yield schedule on a token.
 *
 * This schema validates the request parameters for associating an existing
 * fixed yield schedule contract with a token, enabling yield-bearing functionality.
 *
 * @property {string} contract - The token contract address
 * @property {string} schedule - The existing yield schedule contract address
 * @property {Object} walletVerification - Wallet verification details for transaction signing
 */
export const TokenSetYieldScheduleInputSchema =
  MutationInputSchemaWithContract.extend({
    schedule: ethereumAddress.describe(
      "The yield schedule contract address to associate with the token"
    ),
  });

export type TokenSetYieldScheduleInput = z.infer<
  typeof TokenSetYieldScheduleInputSchema
>;
