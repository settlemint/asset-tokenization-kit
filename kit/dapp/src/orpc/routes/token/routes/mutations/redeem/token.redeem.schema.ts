import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const TokenRedeemInputSchema = MutationInputSchemaWithContract.extend({
  owner: ethereumAddress
    .optional()
    .describe("Token holder address to redeem for (defaults to caller)"),
  amount: apiBigInt.describe("Amount of tokens to redeem").optional(),
  redeemAll: z
    .boolean()
    .optional()
    .default(false)
    .describe("Redeem the holder's full token balance"),
}).superRefine((value, ctx) => {
  if (!value.redeemAll && value.amount === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "Amount required when redeemAll is false",
      path: ["amount"],
    });
  }
});

export type TokenRedeemInput = z.infer<typeof TokenRedeemInputSchema>;
