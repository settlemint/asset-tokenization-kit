import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { amount } from "@atk/zod/amount";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

export const TokenUnfreezePartialInputSchema =
  MutationInputSchemaWithContract.extend({
    userAddress: ethereumAddress.describe("The address to unfreeze tokens for"),
    amount: amount({ min: 0.000_000_000_000_000_001 }).describe(
      "The amount of tokens to unfreeze"
    ),
  });

export type TokenUnfreezePartialInput = z.infer<
  typeof TokenUnfreezePartialInputSchema
>;
