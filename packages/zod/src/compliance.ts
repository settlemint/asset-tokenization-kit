/**
 * Compliance Module Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating compliance modules
 * and their parameters, ensuring they match predefined enumerations. It's designed
 * to support the asset tokenization platform's various compliance requirements.
 * @module ComplianceValidation
 */

import { z } from "zod";
import { apiBigInt } from "./bigint";
import { ethereumAddress } from "./ethereum-address";
import { expressionNodeWithGroups } from "./expression-node";
import { isoCountryCodeNumeric } from "./iso-country-code";

/**
 * Tuple of valid compliance module typeIds for type-safe iteration.
 * @remarks
 * This constant defines all supported compliance module typeIds in the platform:
 * - `AddressBlockListComplianceModule`: Block specific addresses from transactions
 * - `CountryAllowListComplianceModule`: Allow only specific countries
 * - `CountryBlockListComplianceModule`: Block specific countries
 * - `IdentityAllowListComplianceModule`: Allow only specific identities
 * - `IdentityBlockListComplianceModule`: Block specific identities
 * - `SMARTIdentityVerificationComplianceModule`: SMART protocol identity verification
 */
export const complianceTypeIds = [
  "AddressBlockListComplianceModule",
  "CountryAllowListComplianceModule",
  "CountryBlockListComplianceModule",
  "IdentityAllowListComplianceModule",
  "IdentityBlockListComplianceModule",
  "SMARTIdentityVerificationComplianceModule",
  "TokenSupplyLimitComplianceModule",
  "InvestorCountComplianceModule",
  "TimeLockComplianceModule",
  "TransferApprovalComplianceModule",
] as const;

/**
 * Enum-like object for dot notation access to compliance module typeIds.
 * Provides a convenient way to reference compliance module typeIds in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (moduleType === ComplianceTypeIdEnum.AddressBlockListComplianceModule) {
 *   console.log("Processing address block list");
 * }
 *
 * // Use in switch statements
 * switch (complianceTypeId) {
 *   case ComplianceTypeIdEnum.CountryAllowListComplianceModule:
 *     processCountryAllowList();
 *     break;
 *   case ComplianceTypeIdEnum.CountryBlockListComplianceModule:
 *     processCountryBlockList();
 *     break;
 * }
 * ```
 */
export const ComplianceTypeIdEnum = {
  AddressBlockListComplianceModule: "AddressBlockListComplianceModule",
  CountryAllowListComplianceModule: "CountryAllowListComplianceModule",
  CountryBlockListComplianceModule: "CountryBlockListComplianceModule",
  IdentityAllowListComplianceModule: "IdentityAllowListComplianceModule",
  IdentityBlockListComplianceModule: "IdentityBlockListComplianceModule",
  SMARTIdentityVerificationComplianceModule:
    "SMARTIdentityVerificationComplianceModule",
  TokenSupplyLimitComplianceModule: "TokenSupplyLimitComplianceModule",
  InvestorCountComplianceModule: "InvestorCountComplianceModule",
  TimeLockComplianceModule: "TimeLockComplianceModule",
  TransferApprovalComplianceModule: "TransferApprovalComplianceModule",
} as const;

export const complianceTypeId = () =>
  z.enum(complianceTypeIds).describe("Compliance module typeId identifier");

export const countryAllowListValues = () =>
  z
    .array(isoCountryCodeNumeric)
    .describe("Array of ISO country codes to allow");
export const countryBlockListValues = () =>
  z
    .array(isoCountryCodeNumeric)
    .describe("Array of ISO country codes to block");
export const addressBlockListValues = () =>
  z.array(ethereumAddress).describe("Array of Ethereum addresses to block");
export const identityAllowListValues = () =>
  z
    .array(ethereumAddress)
    .describe("Array of identity contract addresses to allow");
export const identityBlockListValues = () =>
  z
    .array(ethereumAddress)
    .describe("Array of identity contract addresses to block");

export const smartIdentityVerificationValues = () =>
  z.array(expressionNodeWithGroups).describe("Array of expression nodes");

export const tokenSupplyLimitValues = () =>
  z
    .object({
      maxSupply: apiBigInt.describe(
        "Maximum allowed supply (whole numbers only). If useBasePrice=false: whole token count (e.g., 1000 = 1000 tokens). If useBasePrice=true: whole currency amount (e.g., 8000000 = €8M). For MiCA compliance, specify 8000000."
      ),
      periodLength: z
        .number()
        .int()
        .min(0)
        .describe(
          "Length of tracking period in days. 0 = lifetime cap, >0 = periodic cap (fixed or rolling window)."
        ),
      rolling: z
        .boolean()
        .describe(
          "Whether to use rolling window (true) or fixed periods (false). Only applicable when periodLength > 0."
        ),
      useBasePrice: z
        .boolean()
        .describe(
          "Whether to convert token amounts to base currency using price claims for limit calculation."
        ),
      global: z
        .boolean()
        .describe(
          "Track globally across all tokens for this issuer (issuer-wide caps)."
        ),
    })
    .describe("Token supply limit parameters");

export const investorCountValues = () =>
  z
    .object({
      maxInvestors: z
        .number()
        .int()
        .min(0)
        .describe(
          "Maximum total investors across all countries (0 = no global limit). Example: maxInvestors=1000 with US=500, EU=300 means max 1000 total, but US capped at 500 and EU at 300 within that total."
        ),
      global: z
        .boolean()
        .describe(
          "Whether to track globally across all tokens for this issuer (issuer-wide caps)."
        ),
      countryCodes: z
        .array(z.number().int().min(0).max(65_535))
        .describe(
          "Array of country codes (ISO 3166-1 numeric). countryCodes[i] corresponds to countryLimits[i]."
        ),
      countryLimits: z
        .array(z.number().int().min(0))
        .describe(
          "Array of investor limits corresponding to countryCodes. Arrays must have the same length."
        ),
      topicFilter: z
        .array(expressionNodeWithGroups)
        .describe(
          "ExpressionNode array for filtering which investors count toward the limit. Uses postfix notation for logical expressions (e.g., KYC AND AML requirements). Empty array means all investors count."
        ),
    })
    .describe("Investor count limit parameters");

export const timeLockValues = () =>
  z
    .object({
      holdPeriod: z
        .number()
        .int()
        .min(0)
        .describe(
          "Minimum holding period in seconds before tokens can be transferred."
        ),
      allowExemptions: z
        .boolean()
        .describe("Whether to allow exemptions via identity claims."),
      exemptionExpression: z
        .array(expressionNodeWithGroups)
        .describe(
          "Postfix logical expression for exemption logic (empty array = no exemptions)."
        ),
    })
    .describe("Time lock parameters");

export const transferApprovalValues = () =>
  z
    .object({
      approvalAuthorities: z
        .array(ethereumAddress)
        .describe(
          "Identity addresses allowed to grant approvals for this token."
        ),
      allowExemptions: z
        .boolean()
        .describe("Whether exemptions based on identity claims are allowed."),
      oneTimeUse: z
        .boolean()
        .describe(
          "Whether approvals are single-use (one-time execution); set to true for regulatory compliance."
        ),
      exemptionExpression: z
        .array(expressionNodeWithGroups)
        .describe("Expression defining exemption logic (e.g., [TOPIC_QII])."),
      approvalExpiry: z
        .number()
        .int()
        .min(0)
        .describe("Default expiry for approvals in seconds."),
    })
    .describe("Transfer approval parameters");

/**
 * Discriminated union schema for compliance module parameters.
 * Each compliance module type has specific parameter requirements.
 * @example
 * ```typescript
 * // Address-based compliance module
 * const addressParams = complianceParams().parse({
 *   typeId: "AddressBlockListComplianceModule",
 *   values: ["0x742d35Cc6634C0532925a3b844Bc9e7595f6eD2"]
 * });
 *
 * // Country-based compliance module
 * const countryParams = complianceParams().parse({
 *   typeId: "CountryAllowListComplianceModule",
 *   values: ["840", "056"]
 * });
 *
 * // Identity verification module (no params)
 * const smartParams = complianceParams().parse({
 *   typeId: "SMARTIdentityVerificationComplianceModule",
 *   values: []
 * });
 * ```
 */
export const complianceParams = () =>
  z
    .discriminatedUnion("typeId", [
      z.object({
        typeId: z.literal("AddressBlockListComplianceModule"),
        values: addressBlockListValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("CountryAllowListComplianceModule"),
        values: countryAllowListValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("CountryBlockListComplianceModule"),
        values: countryBlockListValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("IdentityAllowListComplianceModule"),
        values: identityAllowListValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("IdentityBlockListComplianceModule"),
        values: identityBlockListValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("SMARTIdentityVerificationComplianceModule"),
        values: smartIdentityVerificationValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("TokenSupplyLimitComplianceModule"),
        values: tokenSupplyLimitValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("InvestorCountComplianceModule"),
        values: investorCountValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("TimeLockComplianceModule"),
        values: timeLockValues(),
        module: ethereumAddress,
      }),
      z.object({
        typeId: z.literal("TransferApprovalComplianceModule"),
        values: transferApprovalValues(),
        module: ethereumAddress,
      }),
    ])

    .describe("Compliance module configuration with type-specific parameters");

/**
 * Schema for a compliance module pair that combines typeId and values.
 * This is used for the 'initialModulePairs' field in token creation schemas.
 * @example
 * ```typescript
 * // Address-based compliance module pair
 * const addressPair = complianceModulePair().parse({
 *   typeId: "AddressBlockListComplianceModule",
 *   values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"]
 * });
 *
 * // Country-based compliance module pair
 * const countryPair = complianceModulePair().parse({
 *   typeId: "CountryAllowListComplianceModule",
 *   values: ["840", "276"]
 * });
 *
 * // Array of compliance module pairs
 * const modulePairs = complianceModulePairArray().parse([
 *   { typeId: "AddressBlockListComplianceModule", values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"] },
 *   { typeId: "CountryAllowListComplianceModule", values: ["840", "276"] }
 * ]);
 * ```
 */
export const complianceModulePair = () =>
  complianceParams().describe("Compliance module pair with typeId and values");

/**
 * Creates an array validator for multiple compliance module pairs.
 * Used for the 'initialModulePairs' field in token creation.
 * @returns A Zod array schema that validates a list of compliance module pairs
 * @example
 * ```typescript
 * const schema = complianceModulePairArray();
 * schema.parse([
 *   { typeId: "AddressBlockListComplianceModule", values: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"] },
 *   { typeId: "CountryAllowListComplianceModule", values: ["840", "276"] }
 * ]); // Valid
 * schema.parse([]); // Valid - empty array allowed
 * ```
 */
export const complianceModulePairArray = () =>
  z
    .array(complianceModulePair())
    .default([])
    .describe("Array of compliance module pairs for token initialization");

// Export types
/**
 * Type representing a validated compliance module typeId.
 * Ensures type safety.
 */
export type ComplianceTypeId = z.infer<ReturnType<typeof complianceTypeId>>;

/**
 * Type representing validated compliance module parameters.
 * Ensures type safety for the discriminated union.
 */
export type ComplianceParams = z.infer<ReturnType<typeof complianceParams>>;

/**
 * Type representing a compliance module pair with typeId and values.
 * Used for token initialization and configuration.
 */
export type ComplianceModulePairInput = z.input<
  ReturnType<typeof complianceModulePair>
>;

/**
 * Type representing an array of compliance module pairs.
 * Used for the 'initialModulePairs' field in token creation schemas.
 */
export type ComplianceModulePairInputArray = z.input<
  ReturnType<typeof complianceModulePairArray>
>;

/**
 * Type representing the value of a token supply limit compliance module.
 */
export type TokenSupplyLimitParams = z.infer<
  ReturnType<typeof tokenSupplyLimitValues>
>;

/**
 * Type representing the value of a time lock compliance module.
 */
export type TimeLockParams = z.infer<ReturnType<typeof timeLockValues>>;

/**
 * Type representing the value of a transfer approval compliance module.
 */
export type TransferApprovalParams = z.infer<
  ReturnType<typeof transferApprovalValues>
>;

/**
 * Type representing the value of an investor count compliance module.
 */
export type InvestorCountParams = z.infer<
  ReturnType<typeof investorCountValues>
>;
