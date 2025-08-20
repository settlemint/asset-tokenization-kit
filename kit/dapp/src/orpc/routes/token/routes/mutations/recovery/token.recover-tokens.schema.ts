import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import type { z } from "zod";

export const TokenRecoverTokensInputSchema =
  MutationInputSchemaWithContract.extend({
    lostWallet: ethereumAddress.describe(
      "The address of the lost wallet to recover tokens from"
    ),
  });

export type TokenRecoverTokensInput = z.infer<
  typeof TokenRecoverTokensInputSchema
>;
