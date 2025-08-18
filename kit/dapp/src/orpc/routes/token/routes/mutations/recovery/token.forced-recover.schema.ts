import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import type { z } from "zod";

export const TokenForcedRecoverInputSchema =
  MutationInputSchemaWithContract.extend({
    lostWallet: ethereumAddress.describe(
      "The address of the lost wallet to recover tokens from"
    ),
    newWallet: ethereumAddress.describe(
      "The address of the new wallet to recover tokens to"
    ),
  });

export type TokenForcedRecoverInput = z.infer<
  typeof TokenForcedRecoverInputSchema
>;
