import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Dynamic claim topic schema - validates that the topic name is a non-empty string.
 * Actual topic validation against the blockchain registry happens in the route handler.
 */
export const ClaimTopicNameSchema = z
  .string()
  .min(1, "Topic name is required")
  .max(100, "Topic name must be less than 100 characters")
  .describe("The topic name as registered in the blockchain registry");

/**
 * Dynamic claim data schema that accepts any topic name and flexible data structure.
 * Specific validation against topic signatures happens in the route handler.
 */
export const ClaimDataSchema = z.object({
  /**
   * The topic name as registered in the blockchain registry
   */
  topicName: ClaimTopicNameSchema,
  /**
   * The claim data as a flexible record - structure will be validated
   * against the topic's signature at runtime
   */
  data: z.record(z.string(), z.unknown()).describe("Claim data matching the topic signature"),
});

/**
 * Input schema for claims issue endpoint.
 */
export const ClaimsIssueInputSchema = z.object({
  /**
   * Target identity contract address to issue the claim to.
   */
  targetIdentityAddress: ethereumAddress.describe(
    "Identity contract address to issue claim to"
  ),

  /**
   * Claim information including topic and data.
   */
  claim: ClaimDataSchema,

  /**
   * Wallet verification for the issuer.
   */
  walletVerification: UserVerificationSchema,
});

/**
 * Output schema for claims issue endpoint.
 */
export const ClaimsIssueOutputSchema = z.object({
  /**
   * Whether the claim was successfully issued.
   */
  success: z.boolean().describe("Whether claim issuance was successful"),

  /**
   * Transaction hash if successful.
   */
  transactionHash: z
    .string()
    .optional()
    .describe("Blockchain transaction hash"),

  /**
   * Error message if unsuccessful.
   */
  error: z.string().optional().describe("Error message if issuance failed"),

  /**
   * The issued claim topic for confirmation.
   */
  claimTopic: z.string().describe("The claim topic that was issued"),

  /**
   * Target user's wallet address for confirmation.
   */
  targetWallet: ethereumAddress.describe("Wallet address claim was issued to"),
});

export type ClaimTopicName = z.infer<typeof ClaimTopicNameSchema>;
export type ClaimData = z.infer<typeof ClaimDataSchema>;
export type ClaimsIssueInput = z.infer<typeof ClaimsIssueInputSchema>;
export type ClaimsIssueOutput = z.infer<typeof ClaimsIssueOutputSchema>;
