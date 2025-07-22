import { apiBigInt } from "@/lib/zod/validators/bigint";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenSetCapInputSchema = MutationInputSchemaWithContract.extend({
  newCap: apiBigInt.describe("The new cap amount for the token"),
});

export type TokenSetCapInput = z.infer<typeof TokenSetCapInputSchema>;
