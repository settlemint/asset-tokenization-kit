import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import * as z from "zod";

export const TokenRedeemInputSchema = MutationInputSchemaWithContract.extend({
  owner: z
    .string()
    .trim()
    .optional()
    .describe("Token holder address to redeem for (defaults to caller)"),
  amount: apiBigInt.describe("Amount of tokens to redeem"),
});

export type TokenRedeemInput = z.infer<typeof TokenRedeemInputSchema>;
