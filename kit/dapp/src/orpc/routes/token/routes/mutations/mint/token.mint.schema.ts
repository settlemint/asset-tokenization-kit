import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

/**
 * Messages schema for token mint operation
 */
export const TokenMintMessagesSchema = TransactionTrackingMessagesSchema.extend(
  {
    // Initial states
    preparingMint: z.string().optional().default("Preparing to mint tokens..."),
    submittingMint: z
      .string()
      .optional()
      .default("Submitting mint transaction..."),

    // Success states
    tokensMinted: z.string().optional().default("Tokens minted successfully"),

    // Error states
    mintFailed: z.string().optional().default("Failed to mint tokens"),
    defaultError: z
      .string()
      .optional()
      .default("An error occurred while minting tokens"),
  }
);

export const TokenMintInputSchema = MutationInputSchemaWithContract.extend({
  recipients: z
    .union([
      // Single recipient - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of recipients
      z
        .array(ethereumAddress)
        .min(1, "At least one recipient required")
        .max(100),
    ])
    .describe("Recipient address(es) for minted tokens"),
  amounts: z
    .union([
      // Single amount - transform to array
      apiBigInt.transform((amt) => [amt]),
      // Array of amounts
      z.array(apiBigInt).min(1, "At least one amount required").max(100),
    ])
    .describe("Amount(s) of tokens to mint"),
  messages: TokenMintMessagesSchema.optional(),
}).refine(
  (data) => {
    // Ensure arrays have the same length after transformation
    return data.recipients.length === data.amounts.length;
  },
  {
    message: "Number of recipients must match number of amounts",
    path: ["amounts"],
  }
);

/**
 * Output schema for token mint operation
 */
export const TokenMintOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenMintInput = z.infer<typeof TokenMintInputSchema>;
export type TokenMintOutput = z.infer<typeof TokenMintOutputSchema>;
