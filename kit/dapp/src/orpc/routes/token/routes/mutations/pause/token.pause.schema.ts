import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

/**
 * Messages schema for token pause operation
 */
export const TokenPauseMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    // Initial states
    preparingPause: z
      .string()
      .optional()
      .default("Preparing to pause token..."),
    submittingPause: z
      .string()
      .optional()
      .default("Submitting pause transaction..."),

    // Success states
    tokenPaused: z.string().optional().default("Token paused successfully"),

    // Error states
    pauseFailed: z.string().optional().default("Failed to pause token"),
    defaultError: z
      .string()
      .optional()
      .default("An error occurred while pausing the token"),
  });

export const TokenPauseInputSchema = MutationInputSchemaWithContract.extend({
  messages: TokenPauseMessagesSchema.optional(),
});

/**
 * Output schema for token pause operation
 */
export const TokenPauseOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenPauseInput = z.infer<typeof TokenPauseInputSchema>;
export type TokenPauseOutput = z.infer<typeof TokenPauseOutputSchema>;
