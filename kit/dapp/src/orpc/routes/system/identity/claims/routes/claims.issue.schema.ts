import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Enum of supported claim topics for issuing claims.
 * Subset of all available claim topics that can be issued via API.
 */
export const IssueableClaimTopicSchema = z.enum([
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
 * Dynamic claim data schema based on claim topic.
 * Different claim types require different data structures.
 */
export const ClaimDataSchema = z.discriminatedUnion("topic", [
  // Generic claims (investor-level)
  z.object({
    topic: z.enum([
      "knowYourCustomer",
      "antiMoneyLaundering",
      "qualifiedInstitutionalInvestor",
      "professionalInvestor",
      "accreditedInvestor",
      "accreditedInvestorVerified",
      "regulationS",
    ]),
    data: z.object({
      claim: z.string().describe("Claim value or description"),
    }),
  }),

  // Asset classification claim
  z.object({
    topic: z.literal("assetClassification"),
    data: z.object({
      class: z.string().describe("Asset class"),
      category: z.string().describe("Asset category"),
    }),
  }),

  // Asset issuer claim
  z.object({
    topic: z.literal("assetIssuer"),
    data: z.object({
      issuerAddress: ethereumAddress.describe("Issuer's wallet address"),
    }),
  }),

  // Base price claim
  z.object({
    topic: z.literal("basePrice"),
    data: z.object({
      amount: z
        .string()
        .describe("Price amount as string (to handle big numbers)"),
      currencyCode: z.string().describe("Currency code (e.g., USD, EUR)"),
      decimals: z
        .number()
        .int()
        .min(0)
        .max(18)
        .describe("Number of decimal places"),
    }),
  }),

  // Collateral claim
  z.object({
    topic: z.literal("collateral"),
    data: z.object({
      amount: z.string().describe("Collateral amount as string"),
      expiryTimestamp: z.string().describe("Expiry timestamp as string"),
    }),
  }),

  // Contract identity claim
  z.object({
    topic: z.literal("contractIdentity"),
    data: z.object({
      contractAddress: ethereumAddress.describe("Contract address"),
    }),
  }),

  // ISIN claim
  z.object({
    topic: z.literal("isin"),
    data: z.object({
      isin: z.string().length(12).describe("12-character ISIN code"),
    }),
  }),

  // Issuer jurisdiction claim
  z.object({
    topic: z.literal("issuerJurisdiction"),
    data: z.object({
      jurisdiction: z.string().describe("Jurisdiction code or name"),
    }),
  }),

  // Issuer licensed claim
  z.object({
    topic: z.literal("issuerLicensed"),
    data: z.object({
      licenseType: z.string().describe("Type of license"),
      licenseNumber: z.string().describe("License number"),
      jurisdiction: z.string().describe("Licensing jurisdiction"),
      validUntil: z
        .string()
        .describe("License validity end date as timestamp string"),
    }),
  }),

  // Issuer prospectus exempt claim
  z.object({
    topic: z.literal("issuerProspectusExempt"),
    data: z.object({
      exemptionReference: z
        .string()
        .describe("Exemption reference or regulation"),
    }),
  }),

  // Issuer prospectus filed claim
  z.object({
    topic: z.literal("issuerProspectusFiled"),
    data: z.object({
      prospectusReference: z.string().describe("Prospectus filing reference"),
    }),
  }),

  // Issuer reporting compliant claim
  z.object({
    topic: z.literal("issuerReportingCompliant"),
    data: z.object({
      compliant: z.boolean().describe("Whether reporting is compliant"),
      lastUpdated: z.string().describe("Last update timestamp as string"),
    }),
  }),

  // Custom claim
  z.object({
    topic: z.literal("custom"),
    topicName: z
      .string()
      .min(1, "Topic name is required")
      .max(100, "Topic name must be less than 100 characters")
      .describe("The topic name as registered in the blockchain registry"),
    signature: z.string().describe("Signature of the claim"),
    data: z.array(z.unknown()),
  }),
]);

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

export type IssueableClaimTopic = z.infer<typeof IssueableClaimTopicSchema>;
export type ClaimData = z.infer<typeof ClaimDataSchema>;
export type ClaimsIssueInput = z.infer<typeof ClaimsIssueInputSchema>;
export type ClaimsIssueOutput = z.infer<typeof ClaimsIssueOutputSchema>;
