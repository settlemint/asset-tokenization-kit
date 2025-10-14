/**
 * Claim Validation Utilities
 *
 * This module provides Zod-based validation for user identity claims,
 * ensuring they conform to the expected structure from the subgraph
 * and providing type-safe interfaces for claim handling.
 * @module ClaimValidation
 */
import * as z from "zod";
import { ethereumAddress } from "./ethereum-address";

/**
 * Zod schema for validating claim key-value pairs
 *
 * Represents individual claim data as key-value string pairs.
 */
export const claimValue = z.object({
  key: z.string().describe("The claim value key"),
  value: z.string().describe("The claim value data"),
});

/**
 * Zod schema for validating claim issuers
 *
 * Represents the entity that issued the claim.
 */
export const claimIssuer = z.object({
  id: ethereumAddress.describe("Ethereum address of the claim issuer"),
});

/**
 * Zod schema for validating user identity claims
 *
 * This schema provides comprehensive validation for identity claims with the following features:
 * - Composite claim ID validation from subgraph (identity + claimId)
 * - Human-readable claim topic name
 * - Revocation status tracking
 * - Issuer information with Ethereum address validation
 * - Array of key-value pairs for claim data
 *
 * @example
 * ```typescript
 * // Valid claim parsing
 * const claim = identityClaim.parse({
 *   id: "0x123...abc-42",
 *   name: "KYC Verification",
 *   revoked: false,
 *   issuer: { id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f" },
 *   values: [
 *     { key: "name", value: "John Doe" },
 *     { key: "verified", value: "true" }
 *   ]
 * });
 *
 * // Safe parsing with error handling
 * const result = identityClaim.safeParse(claimData);
 * if (result.success) {
 *   console.log(result.data.name); // "KYC Verification"
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const identityClaim = z.object({
  id: z
    .string()
    .describe("Composite claim ID from subgraph (identity + claimId)"),
  name: z.string().describe("Human-readable claim topic name"),
  revoked: z.boolean().describe("Whether the claim has been revoked"),
  issuer: claimIssuer,
  values: z.array(claimValue),
});

/**
 * Type representing a validated user identity claim
 *
 * This type represents a validated identity claim with all required
 * fields and proper typing for the issuer address.
 */
export type IdentityClaim = z.infer<typeof identityClaim>;

/**
 * Type representing claim key-value pairs
 */
export type ClaimValue = z.infer<typeof claimValue>;

/**
 * Type representing a claim issuer
 */
export type ClaimIssuer = z.infer<typeof claimIssuer>;

/**
 * Type guard to check if a value is a valid identity claim
 * @param value - The value to check
 * @returns True if the value is a valid IdentityClaim
 */
export function isIdentityClaim(value: unknown): value is IdentityClaim {
  return identityClaim.safeParse(value).success;
}

/**
 * Parse and validate an identity claim
 * @param value - The value to parse as an identity claim
 * @returns Validated IdentityClaim
 * @throws {ZodError} When validation fails
 */
export function parseIdentityClaim(value: unknown): IdentityClaim {
  return identityClaim.parse(value);
}

/**
 * Enum of supported claim topics that can be issued or revoked via API.
 * These represent the standardized claim types supported by the platform.
 */
export const ClaimTopicSchema = z.enum([
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
 * Type representing a supported claim topic
 */
export type ClaimTopic = z.infer<typeof ClaimTopicSchema>;
