import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import type { z } from "zod";

export const TokenApproveInputSchema = MutationInputSchemaWithContract.extend({
  spender: ethereumAddress.describe("The address to approve as spender"),
  amount: apiBigInt.describe("The amount to approve for spending"),
});

export type TokenApproveInput = z.infer<typeof TokenApproveInputSchema>;
