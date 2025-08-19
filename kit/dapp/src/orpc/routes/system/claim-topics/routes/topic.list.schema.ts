import { z } from "zod";

/**
 * Topic Scheme Schema
 * Represents a claim topic scheme in the registry
 */
export const TopicSchemeSchema = z.object({
  id: z.string().describe("Unique identifier (bytes32)"),
  topicId: z.string().describe("Numeric topic ID as string"),
  name: z.string().describe("Human-readable name of the topic"),
  signature: z.string().describe("Function signature for verification"),
  registry: z.object({
    id: z.string().describe("Registry contract address"),
  }),
});

export type TopicScheme = z.infer<typeof TopicSchemeSchema>;

/**
 * Topic List Output Schema
 * Array of topic schemes returned from the subgraph
 */
export const TopicListOutputSchema = z.array(TopicSchemeSchema);

export type TopicListOutput = z.infer<typeof TopicListOutputSchema>;