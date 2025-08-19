import type { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";
import { BaseMutationOutputSchema } from "@/routes/common/schemas/mutation-output.schema";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";

export const TokenUnpauseInputSchema = MutationInputSchemaWithContract;

/**
 * Output schema for token unpause operation
 * Returns the ethereum hash and the updated token data
 */
export const TokenUnpauseOutputSchema = BaseMutationOutputSchema.extend({
  data: TokenSchema.partial().describe("The updated token data"),
});

// Type exports using Zod's type inference
export type TokenUnpauseInput = z.infer<typeof TokenUnpauseInputSchema>;
export type TokenUnpauseOutput = z.infer<typeof TokenUnpauseOutputSchema>;
