/**
 * Compliance Module Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating compliance modules
 * and their parameters, ensuring they match predefined enumerations. It's designed
 * to support the asset tokenization platform's various compliance requirements.
 * @module ComplianceValidation
 */
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { z } from "zod";

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
      // Address-based compliance modules
      z.object({
        typeId: z.literal("AddressBlockListComplianceModule"),
        params: z
          .array(ethereumAddress)
          .describe("Array of Ethereum addresses to block"),
      }),
      // Country-based compliance modules
      z.object({
        typeId: z.literal("CountryAllowListComplianceModule"),
        params: z
          .array(isoCountryCode)
          .describe("Array of ISO country codes to allow"),
      }),
      z.object({
        typeId: z.literal("CountryBlockListComplianceModule"),
        params: z
          .array(isoCountryCode)
          .describe("Array of ISO country codes to block"),
      }),
      // Identity-based compliance modules (using addresses as identity references)
      z.object({
        typeId: z.literal("IdentityAllowListComplianceModule"),
        params: z
          .array(ethereumAddress)
          .describe("Array of identity contract addresses to allow"),
      }),
      z.object({
        typeId: z.literal("IdentityBlockListComplianceModule"),
        params: z
          .array(ethereumAddress)
          .describe("Array of identity contract addresses to block"),
      }),
      // SMART Identity Verification (no specific params needed)
      z.object({
        typeId: z.literal("SMARTIdentityVerificationComplianceModule"),
        params: z
          .array(z.string())
          .length(
            0,
            "SMART Identity Verification module does not accept parameters"
          )
          .default([])
          .describe("Empty array (no parameters required)"),
      }),
    ])
    .describe("Compliance module configuration with type-specific parameters");

/**
 * Creates an array validator for multiple compliance module typeIds.
 * Ensures at least one compliance module is selected.
 * @returns A Zod array schema that validates a list of compliance module typeIds
 * @example
 * ```typescript
 * const schema = complianceTypeIdArray();
 * schema.parse(["AddressBlockListComplianceModule", "CountryAllowListComplianceModule"]); // Valid
 * schema.parse([]); // Invalid - empty array
 * schema.parse(["invalid"]); // Invalid - unknown typeId
 * ```
 */
export const complianceTypeIdArray = () =>
  z
    .array(complianceTypeId())
    .min(1, "At least one compliance module must be selected")
    .describe("List of compliance module typeIds");

/**
 * Creates a set validator for unique compliance module typeIds.
 * Automatically removes duplicates and ensures at least one typeId.
 * @returns A Zod set schema that validates unique compliance module typeIds
 * @example
 * ```typescript
 * const schema = complianceTypeIdSet();
 * schema.parse(new Set(["AddressBlockListComplianceModule", "CountryAllowListComplianceModule"])); // Valid
 * schema.parse(new Set(["AddressBlockListComplianceModule", "AddressBlockListComplianceModule"])); // Valid - duplicates removed
 * schema.parse(new Set()); // Invalid - empty set
 * ```
 */
export const complianceTypeIdSet = () =>
  z
    .set(complianceTypeId())
    .min(1, "At least one compliance module must be selected")
    .describe("Set of unique compliance module typeIds");

/**
 * Creates a compliance module typeId validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default compliance module typeId (defaults to "AddressBlockListComplianceModule")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = complianceTypeIdWithDefault("CountryAllowListComplianceModule");
 * schema.parse(undefined); // Returns "CountryAllowListComplianceModule"
 * schema.parse("IdentityAllowListComplianceModule"); // Returns "IdentityAllowListComplianceModule"
 * ```
 */
export const complianceTypeIdWithDefault = (
  defaultValue: ComplianceTypeId = complianceTypeId().parse(
    "AddressBlockListComplianceModule"
  )
) => complianceTypeId().default(defaultValue);

/**
 * Creates a record validator for compliance module typeId to value mappings.
 * Creates a partial record where not all compliance module typeIds need to be present.
 * @template T - The Zod type for the values in the record
 * @param valueSchema - The schema to validate each value
 * @returns A Zod object schema with optional fields for each compliance module typeId
 * @example
 * ```typescript
 * // Create a schema for compliance module configurations
 * const configSchema = complianceTypeIdRecord(z.object({
 *   enabled: z.boolean(),
 *   severity: z.enum(["low", "medium", "high"])
 * }));
 *
 * // Valid - partial configurations
 * configSchema.parse({
 *   AddressBlockListComplianceModule: { enabled: true, severity: "high" },
 *   CountryAllowListComplianceModule: { enabled: false, severity: "medium" }
 * });
 * ```
 */
export const complianceTypeIdRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      AddressBlockListComplianceModule: valueSchema.optional(),
      CountryAllowListComplianceModule: valueSchema.optional(),
      CountryBlockListComplianceModule: valueSchema.optional(),
      IdentityAllowListComplianceModule: valueSchema.optional(),
      IdentityBlockListComplianceModule: valueSchema.optional(),
      SMARTIdentityVerificationComplianceModule: valueSchema.optional(),
    })
    .strict() // Prevent unknown keys
    .describe("Mapping of compliance module typeIds to values");

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
 * Type representing an array of validated compliance module typeIds.
 */
export type ComplianceTypeIdArray = z.infer<
  ReturnType<typeof complianceTypeIdArray>
>;

/**
 * Type representing a set of unique validated compliance module typeIds.
 */
export type ComplianceTypeIdSet = z.infer<
  ReturnType<typeof complianceTypeIdSet>
>;

/**
 * Type guard to check if a value is a valid compliance module typeId.
 * @param value - The value to check
 * @returns `true` if the value is a valid compliance module typeId, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "AddressBlockListComplianceModule";
 * if (isComplianceTypeId(userInput)) {
 *   // TypeScript knows userInput is ComplianceTypeId here
 *   console.log(`Processing ${userInput} module`);
 * }
 * ```
 */
export function isComplianceTypeId(value: unknown): value is ComplianceTypeId {
  return complianceTypeId().safeParse(value).success;
}

/**
 * Safely parse and return a compliance module typeId or throw an error.
 * @param value - The value to parse
 * @returns The validated compliance module typeId
 * @throws {Error} If the value is not a valid compliance module typeId
 * @example
 * ```typescript
 * try {
 *   const typeId = getComplianceTypeId("CountryAllowListComplianceModule"); // Returns "CountryAllowListComplianceModule" as ComplianceTypeId
 *   const invalid = getComplianceTypeId("InvalidModule"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid compliance module typeId provided");
 * }
 * ```
 */
export function getComplianceTypeId(value: unknown): ComplianceTypeId {
  return complianceTypeId().parse(value);
}

/**
 * Type guard to check if a value is valid compliance module parameters.
 * @param value - The value to check
 * @returns `true` if the value is valid compliance module parameters, `false` otherwise
 * @example
 * ```typescript
 * const params = {
 *   typeId: "AddressBlockListComplianceModule",
 *   params: ["0x742d35Cc6634C0532925a3b844Bc9e7595f6eD2"]
 * };
 * if (isComplianceParams(params)) {
 *   // TypeScript knows params is ComplianceParams here
 *   console.log(`Valid compliance configuration`);
 * }
 * ```
 */
export function isComplianceParams(value: unknown): value is ComplianceParams {
  return complianceParams().safeParse(value).success;
}

/**
 * Safely parse and return compliance module parameters or throw an error.
 * @param value - The value to parse
 * @returns The validated compliance module parameters
 * @throws {Error} If the value is not valid compliance module parameters
 * @example
 * ```typescript
 * try {
 *   const params = getComplianceParams({
 *     typeId: "CountryAllowListComplianceModule",
 *     params: ["US", "GB"]
 *   }); // Valid
 * } catch (error) {
 *   console.error("Invalid compliance parameters");
 * }
 * ```
 */
export function getComplianceParams(value: unknown): ComplianceParams {
  return complianceParams().parse(value);
}

/**
 * Type guard to check if a value is a valid compliance module typeId array.
 * @param value - The value to check
 * @returns `true` if the value is a valid compliance module typeId array, `false` otherwise
 * @example
 * ```typescript
 * if (isComplianceTypeIdArray(["AddressBlockListComplianceModule", "CountryAllowListComplianceModule"])) {
 *   console.log("Valid compliance module typeId array");
 * }
 * ```
 */
export function isComplianceTypeIdArray(
  value: unknown
): value is ComplianceTypeIdArray {
  return complianceTypeIdArray().safeParse(value).success;
}

/**
 * Safely parse and return a compliance module typeId array or throw an error.
 * @param value - The value to parse
 * @returns The validated compliance module typeId array
 * @throws {Error} If the value is not a valid compliance module typeId array
 * @example
 * ```typescript
 * const typeIds = getComplianceTypeIdArray(["AddressBlockListComplianceModule", "CountryAllowListComplianceModule"]); // Valid
 * const empty = getComplianceTypeIdArray([]); // Throws Error - empty array
 * ```
 */
export function getComplianceTypeIdArray(
  value: unknown
): ComplianceTypeIdArray {
  return complianceTypeIdArray().parse(value);
}

/**
 * Type guard to check if a value is a valid compliance module typeId set.
 * @param value - The value to check
 * @returns `true` if the value is a valid compliance module typeId set, `false` otherwise
 * @example
 * ```typescript
 * const mySet = new Set(["AddressBlockListComplianceModule", "CountryAllowListComplianceModule"]);
 * if (isComplianceTypeIdSet(mySet)) {
 *   console.log("Valid compliance module typeId set");
 * }
 * ```
 */
export function isComplianceTypeIdSet(
  value: unknown
): value is ComplianceTypeIdSet {
  return complianceTypeIdSet().safeParse(value).success;
}

/**
 * Safely parse and return a compliance module typeId set or throw an error.
 * @param value - The value to parse
 * @returns The validated compliance module typeId set
 * @throws {Error} If the value is not a valid compliance module typeId set
 * @example
 * ```typescript
 * const typeIds = getComplianceTypeIdSet(new Set(["AddressBlockListComplianceModule", "CountryAllowListComplianceModule"])); // Valid
 * const empty = getComplianceTypeIdSet(new Set()); // Throws Error - empty set
 * ```
 */
export function getComplianceTypeIdSet(value: unknown): ComplianceTypeIdSet {
  return complianceTypeIdSet().parse(value);
}

/**
 * Utility function to determine if a compliance module is address-based.
 * @param typeId - The compliance module typeId to check
 * @returns `true` if the module handles addresses, `false` otherwise
 * @example
 * ```typescript
 * isAddressBasedCompliance("AddressBlockListComplianceModule"); // Returns true
 * isAddressBasedCompliance("CountryAllowListComplianceModule"); // Returns false
 * ```
 */
export function isAddressBasedCompliance(typeId: ComplianceTypeId): boolean {
  return (
    typeId === "AddressBlockListComplianceModule" ||
    typeId === "IdentityAllowListComplianceModule" ||
    typeId === "IdentityBlockListComplianceModule"
  );
}

/**
 * Utility function to determine if a compliance module is country-based.
 * @param typeId - The compliance module typeId to check
 * @returns `true` if the module handles countries, `false` otherwise
 * @example
 * ```typescript
 * isCountryBasedCompliance("CountryAllowListComplianceModule"); // Returns true
 * isCountryBasedCompliance("AddressBlockListComplianceModule"); // Returns false
 * ```
 */
export function isCountryBasedCompliance(typeId: ComplianceTypeId): boolean {
  return (
    typeId === "CountryAllowListComplianceModule" ||
    typeId === "CountryBlockListComplianceModule"
  );
}

/**
 * Utility function to get a human-readable description of a compliance module.
 * @param typeId - The compliance module typeId
 * @returns A human-readable description of the module's purpose
 * @example
 * ```typescript
 * getComplianceDescription("AddressBlockListComplianceModule");
 * // Returns "Blocks specific addresses from transactions"
 * ```
 */
export function getComplianceDescription(typeId: ComplianceTypeId): string {
  const descriptions: Record<ComplianceTypeId, string> = {
    AddressBlockListComplianceModule:
      "Blocks specific addresses from transactions",
    CountryAllowListComplianceModule:
      "Allows transactions only from specific countries",
    CountryBlockListComplianceModule:
      "Blocks transactions from specific countries",
    IdentityAllowListComplianceModule:
      "Allows transactions only from specific identities",
    IdentityBlockListComplianceModule:
      "Blocks transactions from specific identities",
    SMARTIdentityVerificationComplianceModule:
      "Verifies identity using SMART protocol",
  };

  return descriptions[typeId];
}
