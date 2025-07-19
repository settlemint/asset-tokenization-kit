import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenUnpauseInputSchema = MutationInputSchemaWithContract;

/**
 * Output schema for token unpause operation
 */
export const TokenUnpauseOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenUnpauseInput = z.infer<typeof TokenUnpauseInputSchema>;
export type TokenUnpauseOutput = z.infer<typeof TokenUnpauseOutputSchema>;
