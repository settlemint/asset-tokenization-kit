import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import * as z from "zod";

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
    .describe("Claim data ABI types for claim verification"),
});

export type TopicCreateInput = z.infer<typeof TopicCreateInputSchema>;

/**
 * Topic Create Output Schema
 * Response after successfully creating a topic scheme
 */
export const TopicCreateOutputSchema = BaseMutationOutputSchema.extend({
  name: z.string().describe("Name of the created topic"),
});

export type TopicCreateOutput = z.infer<typeof TopicCreateOutputSchema>;
