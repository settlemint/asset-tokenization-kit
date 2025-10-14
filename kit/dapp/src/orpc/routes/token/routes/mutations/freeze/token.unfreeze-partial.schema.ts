import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const TokenUnfreezePartialInputSchema =
  MutationInputSchemaWithContract.extend({
    userAddress: ethereumAddress.describe("The address to unfreeze tokens for"),
    amount: apiBigInt
      .refine((val) => val > 0n, {
        message: "Unfreeze amount must be positive",
      })
      .describe("The amount of tokens to unfreeze (supports dnum format)"),
  });

export type TokenUnfreezePartialInput = z.infer<
  typeof TokenUnfreezePartialInputSchema
>;
