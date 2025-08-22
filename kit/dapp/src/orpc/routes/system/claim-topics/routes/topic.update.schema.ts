import { z } from "zod";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";

/**
 * Topic Update Input Schema
 * Validates input for updating a topic scheme's signature
 */
export const TopicUpdateInputSchema = MutationInputSchema.extend({
  name: z
    .string()
    .min(1, "Topic name is required")
    .describe("Name of the topic scheme to update"),
  signature: z
    .string()
    .min(1, "Signature is required")
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*\([^)]*\)$/,
      "Signature must be a valid function selector (e.g., 'isOver18(address,bytes32)')"
    )
    .describe("New function signature for claim verification"),
});

export type TopicUpdateInput = z.infer<typeof TopicUpdateInputSchema>;

/**
 * Topic Update Output Schema
 * Response after successfully updating a topic scheme
 */
export const TopicUpdateOutputSchema = z.object({
  transactionHash: z.string().describe("Transaction hash of the update"),
  name: z.string().describe("Name of the updated topic"),
  newSignature: z.string().describe("New signature that was set"),
});

export type TopicUpdateOutput = z.infer<typeof TopicUpdateOutputSchema>;
