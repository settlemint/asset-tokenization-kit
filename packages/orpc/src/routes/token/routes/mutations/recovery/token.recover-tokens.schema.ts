import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import type { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";

export const TokenRecoverTokensInputSchema = MutationInputSchemaWithContract.extend({
  lostWallet: ethereumAddress.describe("The address of the lost wallet to recover tokens from"),
});

export type TokenRecoverTokensInput = z.infer<typeof TokenRecoverTokensInputSchema>;
