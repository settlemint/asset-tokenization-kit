import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { normalizeAbiSignature } from "@/lib/utils/abi-signature";
import { z } from "zod";

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
    .describe("New claim data ABI types for claim verification")
    .refine((val) => !val.includes("(") && !val.includes(")"), {
      message: "Remove parentheses; use a comma-separated type list.",
    })
    .transform(normalizeAbiSignature),
});

export type TopicUpdateInput = z.infer<typeof TopicUpdateInputSchema>;

/**
 * Topic Update Output Schema
 * Response after successfully updating a topic scheme
 */
export const TopicUpdateOutputSchema = BaseMutationOutputSchema.extend({
  name: z.string().describe("Name of the updated topic"),
  newSignature: z.string().describe("New signature that was set"),
});

export type TopicUpdateOutput = z.infer<typeof TopicUpdateOutputSchema>;
