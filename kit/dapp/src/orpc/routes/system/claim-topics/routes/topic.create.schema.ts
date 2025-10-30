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
    .describe("Claim data ABI types for claim verification")
    .refine((val) => !val.includes("(") && !val.includes(")"), {
      message: "Remove parentheses; use a comma-separated type list.",
    })
    .refine((val) => !FUNCTION_STYLE_PATTERN.test(val), {
      message: "Remove function name; use type, type, ...",
    })
    .transform(normalizeAbiSignature),
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
