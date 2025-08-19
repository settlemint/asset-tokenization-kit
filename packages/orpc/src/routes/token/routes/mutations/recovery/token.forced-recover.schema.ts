import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import type { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";

export const TokenForcedRecoverInputSchema = MutationInputSchemaWithContract.extend({
  lostWallet: ethereumAddress.describe("The address of the lost wallet to recover tokens from"),
  newWallet: ethereumAddress.describe("The address of the new wallet to recover tokens to"),
});

export type TokenForcedRecoverInput = z.infer<typeof TokenForcedRecoverInputSchema>;
