import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { z } from "zod";

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
