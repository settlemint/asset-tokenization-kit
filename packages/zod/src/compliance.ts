/**
 * Compliance Module Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating compliance modules
 * and their parameters, ensuring they match predefined enumerations. It's designed
 * to support the asset tokenization platform's various compliance requirements.
 * @module ComplianceValidation
 */

import { z } from "zod";
import { ethereumAddress } from "./ethereum-address";
import { ethereumHex } from "./ethereum-hex";
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
} as const;

/**
 * Creates a Zod schema that validates a compliance module typeId.
 * @remarks
 * Features:
 * - Strict enum validation against predefined compliance module typeIds
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must match exact casing)
 * @returns A Zod enum schema for compliance module typeId validation
 * @example
 * ```typescript
 * const schema = complianceTypeId();
 * schema.parse("AddressBlockListComplianceModule"); // Returns "AddressBlockListComplianceModule" as ComplianceTypeId
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   typeId: complianceTypeId(),
 *   params: z.array(z.string())
 * });
 * ```
 */
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

/**
 * Discriminated union schema for compliance module parameters.
 * Each compliance module type has specific parameter requirements.
 * @example
 * ```typescript
 * // Address-based compliance module
 * const addressParams = complianceParams().parse({
 *   typeId: "AddressBlockListComplianceModule",
 *   params: ["0x742d35Cc6634C0532925a3b844Bc9e7595f6eD2"]
 * });
 *
 * // Country-based compliance module
 * const countryParams = complianceParams().parse({
 *   typeId: "CountryAllowListComplianceModule",
 *   params: ["US", "GB", "FR"]
 * });
 *
 * // Identity verification module (no params)
 * const smartParams = complianceParams().parse({
 *   typeId: "SMARTIdentityVerificationComplianceModule",
 *   params: []
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
        params: ethereumHex,
      }),
      z.object({
        typeId: z.literal("CountryAllowListComplianceModule"),
        values: countryAllowListValues(),
        module: ethereumAddress,
        params: ethereumHex,
      }),
      z.object({
        typeId: z.literal("CountryBlockListComplianceModule"),
        values: countryBlockListValues(),
        module: ethereumAddress,
        params: ethereumHex,
      }),
      z.object({
        typeId: z.literal("IdentityAllowListComplianceModule"),
        values: identityAllowListValues(),
        module: ethereumAddress,
        params: ethereumHex,
      }),
      z.object({
        typeId: z.literal("IdentityBlockListComplianceModule"),
        values: identityBlockListValues(),
        module: ethereumAddress,
        params: ethereumHex,
      }),
      z.object({
        typeId: z.literal("SMARTIdentityVerificationComplianceModule"),
        values: smartIdentityVerificationValues(),
        module: ethereumAddress,
        params: ethereumHex,
      }),
    ])

    .describe("Compliance module configuration with type-specific parameters");

/**
 * Schema for a compliance module pair that combines typeId and params.
 * This is used for the 'initialModulePairs' field in token creation schemas.
 * @example
 * ```typescript
 * // Address-based compliance module pair
 * const addressPair = complianceModulePair().parse({
 *   typeId: "AddressBlockListComplianceModule",
 *   params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"]
 * });
 *
 * // Country-based compliance module pair
 * const countryPair = complianceModulePair().parse({
 *   typeId: "CountryAllowListComplianceModule",
 *   params: ["US", "GB"]
 * });
 *
 * // Array of compliance module pairs
 * const modulePairs = complianceModulePairArray().parse([
 *   { typeId: "AddressBlockListComplianceModule", params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"] },
 *   { typeId: "CountryAllowListComplianceModule", params: ["US", "GB"] }
 * ]);
 * ```
 */
export const complianceModulePair = () =>
  complianceParams().describe("Compliance module pair with typeId and params");

/**
 * Creates an array validator for multiple compliance module pairs.
 * Used for the 'initialModulePairs' field in token creation.
 * @returns A Zod array schema that validates a list of compliance module pairs
 * @example
 * ```typescript
 * const schema = complianceModulePairArray();
 * schema.parse([
 *   { typeId: "AddressBlockListComplianceModule", params: ["0x71c7656ec7ab88b098defb751b7401b5f6d8976f"] },
 *   { typeId: "CountryAllowListComplianceModule", params: ["US", "GB"] }
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
 * Type representing a compliance module pair with typeId and params.
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
