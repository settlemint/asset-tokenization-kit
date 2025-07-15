import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

/**
 * Messages schema for token unpause operation
 */
export const TokenUnpauseMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    // Initial states
    preparingUnpause: z
      .string()
      .optional()
      .default("Preparing to unpause token..."),
    submittingUnpause: z
      .string()
      .optional()
      .default("Submitting unpause transaction..."),

    // Success states
    tokenUnpaused: z.string().optional().default("Token unpaused successfully"),

    // Error states
    unpauseFailed: z.string().optional().default("Failed to unpause token"),
    defaultError: z
      .string()
      .optional()
      .default("An error occurred while unpausing the token"),
  });

export const TokenUnpauseInputSchema = MutationInputSchemaWithContract.extend({
  messages: TokenUnpauseMessagesSchema.optional(),
});

/**
 * Output schema for token unpause operation
 */
export const TokenUnpauseOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenUnpauseInput = z.infer<typeof TokenUnpauseInputSchema>;
export type TokenUnpauseOutput = z.infer<typeof TokenUnpauseOutputSchema>;
