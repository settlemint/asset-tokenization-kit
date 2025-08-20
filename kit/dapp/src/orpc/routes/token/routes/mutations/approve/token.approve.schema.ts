import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import type { z } from "zod";

export const TokenApproveInputSchema = MutationInputSchemaWithContract.extend({
  spender: ethereumAddress.describe("The address to approve as spender"),
  amount: apiBigInt.describe("The amount to approve for spending"),
});

/**
 * Output schema for token approve operation
 * Returns the ethereum hash and the updated token data
 */
export const TokenApproveOutputSchema = BaseMutationOutputSchema.extend({
  data: TokenSchema.partial().describe("The updated token data"),
});

export type TokenApproveInput = z.infer<typeof TokenApproveInputSchema>;
export type TokenApproveOutput = z.infer<typeof TokenApproveOutputSchema>;
