import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

/**
 * Messages schema for token burn operation
 */
export const TokenBurnMessagesSchema = TransactionTrackingMessagesSchema.extend(
  {
    // Initial states
    preparingBurn: z.string().optional().default("Preparing to burn tokens..."),
    submittingBurn: z
      .string()
      .optional()
      .default("Submitting burn transaction..."),

    // Success states
    tokensBurned: z.string().optional().default("Tokens burned successfully"),

    // Error states
    burnFailed: z.string().optional().default("Failed to burn tokens"),
    defaultError: z
      .string()
      .optional()
      .default("An error occurred while burning tokens"),
  }
);

export const TokenBurnInputSchema = MutationInputSchemaWithContract.extend({
  addresses: z
    .union([
      // Single address - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of addresses
      z.array(ethereumAddress).min(1, "At least one address required").max(100),
    ])
    .describe("Address(es) to burn tokens from"),
  amounts: z
    .union([
      // Single amount - transform to array
      apiBigInt.transform((amt) => [amt]),
      // Array of amounts
      z.array(apiBigInt).min(1, "At least one amount required").max(100),
    ])
    .describe("Amount(s) of tokens to burn"),
  messages: TokenBurnMessagesSchema.optional(),
}).refine(
  (data) => {
    // Ensure arrays have the same length after transformation
    return data.addresses.length === data.amounts.length;
  },
  {
    message: "Number of addresses must match number of amounts",
    path: ["amounts"],
  }
);

/**
 * Output schema for token burn operation
 */
export const TokenBurnOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenBurnInput = z.infer<typeof TokenBurnInputSchema>;
export type TokenBurnOutput = z.infer<typeof TokenBurnOutputSchema>;
