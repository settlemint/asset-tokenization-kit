import { z } from "zod";

/**
 * Topic Scheme Schema
 * Represents a claim topic scheme in the registry
 */
export const TopicSchemeSchema = z.object({
  id: z.string().describe("Unique identifier (bytes32)"),
  topicId: z.string().describe("Numeric topic ID as string"),
  name: z.string().describe("Human-readable name of the topic"),
  signature: z.string().describe("Claim data ABI types for verification"),
  registry: z.object({
    id: z.string().describe("Registry contract address"),
  }),
});

export type TopicScheme = z.infer<typeof TopicSchemeSchema>;

/**
 * Topic List Schema
 * Array of topic schemes
 */
export const TopicListSchema = z.array(TopicSchemeSchema);

/**
 * Topic List Response Schema
 * Wraps the array of topic schemes in a response object to match TheGraph's response structure
 */
export const TopicListResponseSchema = z.object({
  topicSchemes: TopicListSchema,
});

/**
 * Topic List Output Schema
 * Array of topic schemes returned from the handler
 */
export const TopicListOutputSchema = TopicListSchema;

export type TopicListOutput = z.infer<typeof TopicListOutputSchema>;
