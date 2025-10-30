import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { regex } from "arkregex";
import { z } from "zod";

/**
 * Type-safe regex patterns for ABI signature validation
 */
const WHITESPACE_PATTERN = regex("\\s+", "g");
const FUNCTION_STYLE_PATTERN = regex("^\\w+\\(");

/**
 * Normalizes ABI type signature by trimming spaces around commas and collapsing multiple spaces
 */
function normalizeAbiSignature(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim().replaceAll(WHITESPACE_PATTERN, " "))
    .join(", ");
}

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
    .refine((val) => !FUNCTION_STYLE_PATTERN.test(val), {
      message: "Remove function name; use type, type, ...",
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
