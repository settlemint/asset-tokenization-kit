import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenFreezeAddressInputSchema =
  MutationInputSchemaWithContract.extend({
    userAddress: ethereumAddress.describe("The address to freeze or unfreeze"),
    freeze: z
      .boolean()
      .describe("Whether to freeze (true) or unfreeze (false) the address"),
  });

export type TokenFreezeAddressInput = z.infer<
  typeof TokenFreezeAddressInputSchema
>;
