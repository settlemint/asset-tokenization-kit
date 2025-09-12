import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

export const TokenFreezePartialInputSchema =
  MutationInputSchemaWithContract.extend({
    userAddress: ethereumAddress.describe("The address to freeze tokens for"),
    amount: apiBigInt.describe(
      "The amount of tokens to freeze (supports dnum format)"
    ),
  });

export type TokenFreezePartialInput = z.infer<
  typeof TokenFreezePartialInputSchema
>;
