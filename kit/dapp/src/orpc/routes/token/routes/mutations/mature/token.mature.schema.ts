import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

export const TokenMatureInputSchema = MutationInputSchemaWithContract.describe(
  "Input for maturing a bond token"
);

export type TokenMatureInput = z.infer<typeof TokenMatureInputSchema>;
