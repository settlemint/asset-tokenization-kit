import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenPauseInputSchema = MutationInputSchemaWithContract;

/**
 * Output schema for token pause operation
 */
export const TokenPauseOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenPauseInput = z.infer<typeof TokenPauseInputSchema>;
export type TokenPauseOutput = z.infer<typeof TokenPauseOutputSchema>;
