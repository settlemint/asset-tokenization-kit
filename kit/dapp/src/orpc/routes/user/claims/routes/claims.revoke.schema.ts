import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Enum of claim topics that can be revoked via API.
 * Uses the same topics as issueable claims.
 */
export const RevokableClaimTopicSchema = z.enum([
  // Investor-level claims
  "knowYourCustomer",
  "antiMoneyLaundering",
  "qualifiedInstitutionalInvestor",
  "professionalInvestor",
  "accreditedInvestor",
  "accreditedInvestorVerified",
  "regulationS",

  // Issuer-level claims
  "issuerProspectusFiled",
  "issuerProspectusExempt",
  "issuerLicensed",
  "issuerReportingCompliant",
  "issuerJurisdiction",

  // Asset-level claims
  "collateral",
  "isin",
  "assetClassification",
  "basePrice",
  "assetIssuer",

  // General claims
  "contractIdentity",
]);

/**
 * Input schema for claims revoke endpoint.
 */
export const ClaimsRevokeInputSchema = z.object({
  /**
   * Target user to revoke the claim from (by internal ID).
   */
  targetUserId: z.string().describe("Internal user ID to revoke claim from"),

  /**
   * Claim topic to revoke.
   */
  claimTopic: RevokableClaimTopicSchema.describe("Claim topic to revoke"),

  /**
   * Optional reason for revoking the claim.
   */
  reason: z.string().optional().describe("Reason for revoking the claim"),

  /**
   * Wallet verification for the revoker.
   */
  walletVerification: UserVerificationSchema,
});

/**
 * Output schema for claims revoke endpoint.
 */
export const ClaimsRevokeOutputSchema = z.object({
  /**
   * Whether the claim was successfully revoked.
   */
  success: z.boolean().describe("Whether claim revocation was successful"),

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
  error: z.string().optional().describe("Error message if revocation failed"),

  /**
   * The revoked claim topic for confirmation.
   */
  claimTopic: z.string().describe("The claim topic that was revoked"),

  /**
   * Target user's wallet address for confirmation.
   */
  targetWallet: ethereumAddress.describe(
    "Wallet address claim was revoked from"
  ),

  /**
   * Reason for revocation, if provided.
   */
  reason: z.string().optional().describe("Reason for revocation"),
});

export type RevokableClaimTopic = z.infer<typeof RevokableClaimTopicSchema>;
export type ClaimsRevokeInput = z.infer<typeof ClaimsRevokeInputSchema>;
export type ClaimsRevokeOutput = z.infer<typeof ClaimsRevokeOutputSchema>;
