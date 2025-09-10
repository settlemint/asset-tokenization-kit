import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { amount } from "@atk/zod/amount";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

export const TokenFreezePartialInputSchema =
  MutationInputSchemaWithContract.extend({
    userAddress: ethereumAddress.describe("The address to freeze tokens for"),
    amount: amount({ min: 0.000_000_000_000_000_001 }).describe(
      "The amount of tokens to freeze"
    ),
  });

export type TokenFreezePartialInput = z.infer<
  typeof TokenFreezePartialInputSchema
>;
