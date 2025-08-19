import { z } from "zod";

/**
 * Topic Delete Input Schema
 * Validates input for removing a topic scheme
 */
export const TopicDeleteInputSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .describe("Name of the topic scheme to remove"),
});

export type TopicDeleteInput = z.infer<typeof TopicDeleteInputSchema>;

/**
 * Topic Delete Output Schema
 * Response after successfully removing a topic scheme
 */
export const TopicDeleteOutputSchema = z.object({
  transactionHash: z.string().describe("Transaction hash of the removal"),
  topicId: z.string().describe("Topic ID that was removed"),
  name: z.string().describe("Name of the removed topic"),
});

export type TopicDeleteOutput = z.infer<typeof TopicDeleteOutputSchema>;