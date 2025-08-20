import { z } from "zod";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";

/**
 * Topic Create Input Schema
 * Validates input for creating a new topic scheme
 */
export const TopicCreateInputSchema = MutationInputSchema.extend({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(100, "Topic name must be less than 100 characters")
    .describe("Human-readable name for the topic scheme"),
  signature: z
    .string()
    .min(1, "Signature is required")
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
