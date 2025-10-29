import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { z } from "zod";

export const TokenPauseInputSchema = MutationInputSchemaWithContract;

/**
 * Output schema for token pause operation
 * Returns the ethereum hash and the updated token data
 */
export const TokenPauseOutputSchema = BaseMutationOutputSchema.extend({
  data: TokenSchema.partial().describe("The updated token data"),
});

// Type exports using Zod's type inference
export type TokenPauseInput = z.infer<typeof TokenPauseInputSchema>;
export type TokenPauseOutput = z.infer<typeof TokenPauseOutputSchema>;
