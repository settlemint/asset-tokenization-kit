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
   * Claim ID that was revoked.
   */
  claimId: z.string().describe("Claim ID that was revoked"),
});

export type RevokableClaimTopic = z.infer<typeof RevokableClaimTopicSchema>;
export type ClaimsRevokeInput = z.infer<typeof ClaimsRevokeInputSchema>;
export type ClaimsRevokeOutput = z.infer<typeof ClaimsRevokeOutputSchema>;
