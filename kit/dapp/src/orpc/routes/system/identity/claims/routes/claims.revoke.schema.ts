import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { ClaimTopicSchema } from "@atk/zod/claim";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for custom claim topics registered at runtime.
 */
const CustomClaimTopicSchema = z
  .string()
  .min(1, "Custom claim topic is required")
  .max(100, "Custom claim topic must be less than 100 characters")
  .describe("Custom claim topic registered in the identity registry");

/**
 * Claim topics that can be revoked via API. Supports both predefined and custom topics.
 */
export const RevokableClaimTopicSchema = ClaimTopicSchema.or(
  CustomClaimTopicSchema
);

/**
 * Input schema for claims revoke endpoint.
 */
export const ClaimsRevokeInputSchema = z.object({
  /**
   * Address of the identity the claim was made on.
   * This is the target identity contract that holds the claim.
   */
  targetIdentityAddress: ethereumAddress.describe(
    "Target identity contract address that holds the claim"
  ),
  /**
   * Claim topic to revoke.
   */
  claimTopic: RevokableClaimTopicSchema.describe("Claim topic to revoke"),

  /**
   * Wallet verification for the revoker.
   */
  walletVerification: UserVerificationSchema,
});

/**
 * Output schema for claims revoke endpoint.
 */
export const ClaimsRevokeOutputSchema = BaseMutationOutputSchema.extend({
  /**
   * Whether the claim was successfully revoked.
   */
  success: z.boolean().describe("Whether claim revocation was successful"),

  /**
   * Claim ID that was revoked.
   */
  claimId: z.string().describe("Claim ID that was revoked"),
});

export type RevokableClaimTopic = z.infer<typeof RevokableClaimTopicSchema>;
export type ClaimsRevokeInput = z.infer<typeof ClaimsRevokeInputSchema>;
export type ClaimsRevokeOutput = z.infer<typeof ClaimsRevokeOutputSchema>;
