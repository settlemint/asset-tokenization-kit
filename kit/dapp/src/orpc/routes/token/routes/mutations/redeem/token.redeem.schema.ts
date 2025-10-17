import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import * as z from "zod";

export const TokenRedeemInputSchema = MutationInputSchemaWithContract.extend({
  amount: apiBigInt.describe("The amount of tokens to redeem").optional(),
  redeemAll: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to redeem all tokens (typically for bonds)"),
});

export const TokenRedeemAllInputSchema = MutationInputSchemaWithContract;

export type TokenRedeemInput = z.infer<typeof TokenRedeemInputSchema>;
export type TokenRedeemAllInput = z.infer<typeof TokenRedeemAllInputSchema>;
