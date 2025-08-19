import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";

export const TokenFreezeAddressInputSchema = MutationInputSchemaWithContract.extend({
  userAddress: ethereumAddress.describe("The address to freeze or unfreeze"),
  freeze: z.boolean().describe("Whether to freeze (true) or unfreeze (false) the address"),
});

export type TokenFreezeAddressInput = z.infer<typeof TokenFreezeAddressInputSchema>;
