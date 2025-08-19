import { z } from "zod";

/**
 * Topic Create Input Schema
 * Validates input for creating a new topic scheme
 */
export const TopicCreateInputSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(100, "Topic name must be less than 100 characters")
    .describe("Human-readable name for the topic scheme"),
  signature: z
    .string()
    .min(1, "Signature is required")
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*\([^)]*\)$/,
      "Signature must be a valid function selector (e.g., 'isOver18(address,bytes32)')"
    )
    .describe("Function signature for claim verification"),
});

export type TopicCreateInput = z.infer<typeof TopicCreateInputSchema>;

/**
 * Topic Create Output Schema
 * Response after successfully creating a topic scheme
 */
export const TopicCreateOutputSchema = z.object({
  transactionHash: z.string().describe("Transaction hash of the creation"),
  name: z.string().describe("Name of the created topic"),
});

export type TopicCreateOutput = z.infer<typeof TopicCreateOutputSchema>;