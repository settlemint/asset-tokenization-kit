import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for a topic scheme reference in the trusted issuer context
 */
export const TrustedIssuerTopicSchema = z.object({
  id: z.string().describe("Topic scheme identifier"),
  topicId: z.string().describe("Numeric ID of the topic"),
  name: z.string().describe("Human-readable name of the topic"),
  signature: z.string().describe("Function signature for verification"),
});

/**
 * Schema for a trusted issuer entity
 */
export const TrustedIssuerSchema = z.object({
  id: ethereumAddress.describe("Issuer identity address"),
  claimTopics: z
    .array(TrustedIssuerTopicSchema)
    .describe("Topics this issuer can verify"),
  deployedInTransaction: z
    .string()
    .describe("Transaction hash where this issuer was added"),
});

/**
 * Output schema for listing trusted issuers
 */
export const TrustedIssuerListOutputSchema = z.array(TrustedIssuerSchema);

/**
 * Response schema from TheGraph query
 */
export const TrustedIssuerListResponseSchema = z.object({
  trustedIssuers: TrustedIssuerListOutputSchema,
});

export type TrustedIssuerTopic = z.infer<typeof TrustedIssuerTopicSchema>;
export type TrustedIssuer = z.infer<typeof TrustedIssuerSchema>;
export type TrustedIssuerListOutput = z.infer<
  typeof TrustedIssuerListOutputSchema
>;