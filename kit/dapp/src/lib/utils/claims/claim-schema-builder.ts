/**
 * @fileoverview Dynamic Form Generation for Claim Topics
 *
 * This module provides the core functionality for generating dynamic forms for claim topics
 * in the Asset Tokenization Kit. It supports two distinct approaches:
 *
 * 1. **Predefined Schemas**: For well-known claim topics that have pre-built Zod schemas
 *    in the ClaimDataSchema union (e.g., "assetClassification", "knowYourCustomer")
 *
 * 2. **Custom Signatures**: For dynamic claim topics with Solidity function signatures
 *    that are parsed at runtime to generate appropriate form fields
 *
 * ## Architecture Overview
 *
 * The form generation flow follows this pattern:
 * 1. Topic Selection → Schema Resolution → Field Generation → Form Rendering
 * 2. User Input → Value Transformation → Schema Validation → ClaimData Construction
 *
 * ## Key Components
 *
 * - **Schema Resolution**: `getSchemaForClaim()` determines the appropriate Zod schema
 * - **Field Generation**: `generateFormFields()` creates form field configurations
 * - **Data Construction**: `buildClaimData()` validates and formats claim data
 * - **Type Mapping**: Converts between Solidity types, Zod schemas, and form fields
 *
 * ## Usage in Components
 *
 * This module is primarily used by the IssueClaimSheet component to:
 * - Dynamically generate form fields based on selected claim topics
 * - Validate form input against the correct schema
 * - Transform form values into the expected ClaimData format
 *
 * @see {@link /kit/dapp/src/components/manage-dropdown/sheets/issue-claim-sheet.tsx}
 */

import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { ClaimDataSchema } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { z } from "zod";

/**
 * Configuration for a single form field, generated from a Zod schema property
 */
export interface FormFieldConfig {
  /** The field name as it appears in the schema */
  name: string;
  /** Human-readable label for the form field */
  label: string;
  /** The type of form input to render */
  type: FormFieldType;
  /** Whether the field is required (not optional or nullable) */
  required: boolean;
  /** Optional description from the Zod schema */
  description?: string;
  /** Smart placeholder text based on field name patterns */
  placeholder?: string;
  /** Validation rules extracted from Zod constraints */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

/**
 * Supported form field types that can be generated from Zod schemas
 */
export type FormFieldType =
  | "text" // ZodString
  | "textarea" // ZodString (for long text)
  | "number" // ZodNumber (regular integers)
  | "bigint" // ZodString (for uint256/large numbers)
  | "boolean" // ZodBoolean
  | "checkbox" // ZodBoolean (as checkbox input)
  | "datetime" // ZodDate or timestamp fields
  | "select"; // ZodEnum

/**
 * Extracts the Zod schema for a predefined claim topic from ClaimDataSchema
 *
 * This function searches through the ClaimDataSchema union to find a variant
 * that matches the given topic. It handles both literal topic values and enum
 * topic values (like for KYC claims).
 *
 * @param topic - The claim topic name (e.g., "assetClassification", "knowYourCustomer")
 * @returns The Zod schema for the claim data, or null if not found
 *
 * @example
 * ```typescript
 * const schema = extractSchemaFromClaimDataSchema("assetClassification");
 * // Returns z.object({ category: z.string(), ... })
 * ```
 */
export function extractSchemaFromClaimDataSchema(
  topic: string
): z.ZodObject<z.ZodRawShape> | null {
  const claimVariants = ClaimDataSchema.def.options;

  for (const variant of claimVariants) {
    if (variant instanceof z.ZodObject) {
      const topicField = variant.shape.topic;

      // Check for literal topic match (e.g., "assetClassification")
      if (topicField instanceof z.ZodLiteral && topicField.value === topic) {
        const dataSchema = variant.shape.data;
        if (dataSchema instanceof z.ZodObject) {
          return dataSchema;
        }
      }

      // Check for enum topic match (e.g., "knowYourCustomer")
      if (
        topicField instanceof z.ZodEnum &&
        (topicField.options as readonly string[]).includes(topic)
      ) {
        const dataSchema = variant.shape.data;
        if (dataSchema instanceof z.ZodObject) {
          return dataSchema;
        }
      }
    }
  }

  return null;
}

/**
 * Maps Solidity types to Zod schemas for custom claim signatures
 *
 * This function converts Solidity parameter types into equivalent Zod validation
 * schemas. It handles the most common Solidity types used in claim functions.
 *
 * @param solidityType - The Solidity type (e.g., "string", "uint256", "address")
 * @param paramName - The parameter name for error messages
 * @returns A Zod schema that validates the Solidity type
 *
 * @example
 * ```typescript
 * solidityTypeToZodSchema("uint256", "amount") // → z.string() for large numbers
 * solidityTypeToZodSchema("address", "wallet") // → z.string().regex(...)
 * ```
 */
function solidityTypeToZodSchema(
  solidityType: string,
  paramName: string
): z.ZodType {
  const type = solidityType.toLowerCase();

  if (type === "string" || type.startsWith("bytes")) {
    return z.string().describe(`${paramName} (${solidityType})`);
  }

  if (type === "bool") {
    return z.boolean().describe(`${paramName} (${solidityType})`);
  }

  if (type.startsWith("uint") || type.startsWith("int")) {
    // For large numbers, use string to avoid precision loss
    if (type.includes("256")) {
      return z.string().describe(`${paramName} (${solidityType})`);
    }
    return z.number().describe(`${paramName} (${solidityType})`);
  }

  if (type === "address") {
    return z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
      .describe(`${paramName} (${solidityType})`);
  }

  // Default to string for unknown types
  return z.string().describe(`${paramName} (${solidityType})`);
}

/**
 * Parses a Solidity function signature and generates a Zod schema
 *
 * This function takes a Solidity function signature string and converts it into
 * a Zod object schema that can be used for form validation. Each parameter in
 * the signature becomes a field in the schema.
 *
 * @param signature - The Solidity function signature (e.g., "claim(string value, uint256 amount)")
 * @returns A Zod object schema, or null if parsing fails
 *
 * @example
 * ```typescript
 * const schema = generateSchemaFromSignature("issueIdentity(string name, uint256 timestamp)");
 * // Returns: z.object({ name: z.string(), timestamp: z.string() })
 * ```
 */
export function generateSchemaFromSignature(
  signature: string
): z.ZodObject<z.ZodRawShape> | null {
  try {
    // Parse function signature: "functionName(type1 param1, type2 param2)"
    const match = signature.match(/^(\w+)\s*\(([^)]*)\)$/);
    if (!match) {
      return null;
    }

    const paramsString = match[2];

    if (!paramsString?.trim()) {
      // Function with no parameters
      return z.object({});
    }

    const params = paramsString.split(",").map((p) => p.trim());
    const schemaShape: Record<string, z.ZodType> = {};

    for (const param of params) {
      const parts = param.trim().split(/\s+/);
      if (parts.length < 2) continue;

      const solidityType = parts[0];
      const paramName = parts[1];

      if (solidityType && paramName) {
        schemaShape[paramName] = solidityTypeToZodSchema(
          solidityType,
          paramName
        );
      }
    }

    return z.object(schemaShape);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse signature:", signature, error);
    return null;
  }
}

/**
 * Gets the appropriate Zod schema for a claim topic
 *
 * This is the main entry point for schema resolution. It implements a fallback
 * strategy: first attempting to find a predefined schema, then parsing a custom
 * signature if provided.
 *
 * @param topic - The claim topic name
 * @param signature - Optional Solidity function signature for custom claims
 * @returns A Zod schema for validation, or null if neither approach succeeds
 *
 * @example
 * ```typescript
 * // Predefined schema
 * const schema1 = getSchemaForClaim("assetClassification");
 *
 * // Custom signature
 * const schema2 = getSchemaForClaim("customTopic", "claim(string value)");
 * ```
 */
export function getSchemaForClaim(
  topic: string,
  signature?: string
): z.ZodObject<z.ZodRawShape> | null {
  // Path 1: Try to get schema from ClaimDataSchema
  const predefinedSchema = extractSchemaFromClaimDataSchema(topic);
  if (predefinedSchema) {
    return predefinedSchema;
  }

  // Path 2: Generate schema from signature
  if (signature) {
    return generateSchemaFromSignature(signature);
  }

  return null;
}

/**
 * Maps Zod type constructor names to form field types
 */
const FIELD_TYPE_MAP: Record<string, FormFieldType> = {
  ZodString: "text",
  ZodNumber: "number",
  ZodBoolean: "checkbox",
  ZodDate: "datetime",
  ZodEnum: "select",
} as const;

/**
 * Converts a Zod type to a form field type
 */
function zodTypeToFieldType(zodType: z.ZodType): FormFieldType {
  const typeName = zodType.constructor.name;
  return FIELD_TYPE_MAP[typeName] ?? "text";
}

/**
 * Extracts string validation rules from ZodString
 */
function extractStringValidation(zodString: z.ZodString): {
  min?: number;
  max?: number;
  pattern?: string;
} {
  const validation: { min?: number; max?: number; pattern?: string } = {};

  // Test for min length by attempting to parse empty/short strings
  const shortTests = ["", "a"];
  for (const test of shortTests) {
    const result = zodString.safeParse(test);
    const firstIssue = result.error?.issues?.[0];
    if (!result.success && firstIssue?.code === "too_small") {
      validation.min = firstIssue.minimum as number;
      break;
    }
  }

  // Test for max length with a very long string
  const longString = "a".repeat(1000);
  const longResult = zodString.safeParse(longString);
  if (!longResult.success && longResult.error.issues[0]?.code === "too_big") {
    validation.max = longResult.error.issues[0].maximum as number;
  }

  // Pattern extraction is not supported without accessing internals

  return validation;
}

/**
 * Extracts number validation rules from ZodNumber
 */
function extractNumberValidation(zodNumber: z.ZodNumber): {
  min?: number;
  max?: number;
} {
  const validation: { min?: number; max?: number } = {};

  // Test for min value
  const minTest = zodNumber.safeParse(-999_999);
  if (!minTest.success && minTest.error.issues[0]?.code === "too_small") {
    validation.min = minTest.error.issues[0].minimum as number;
  }

  // Test for max value
  const maxTest = zodNumber.safeParse(999_999);
  if (!maxTest.success && maxTest.error.issues[0]?.code === "too_big") {
    validation.max = maxTest.error.issues[0].maximum as number;
  }

  return validation;
}

/**
 * Extracts validation rules from a Zod type
 */
function extractValidationRules(zodType: z.ZodType) {
  const validation: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  } = {};

  if (zodType instanceof z.ZodString) {
    Object.assign(validation, extractStringValidation(zodType));
  }

  if (zodType instanceof z.ZodNumber) {
    Object.assign(validation, extractNumberValidation(zodType));
  }

  if (zodType instanceof z.ZodEnum) {
    const opts = zodType.options;
    const stringOpts = opts.filter((o): o is string => typeof o === "string");
    if (stringOpts.length === opts.length) {
      validation.options = stringOpts;
    }
  }

  if (zodType instanceof z.ZodOptional) {
    return extractValidationRules(zodType.unwrap() as z.ZodType);
  }

  if (zodType instanceof z.ZodNullable) {
    return extractValidationRules(zodType.unwrap() as z.ZodType);
  }

  return Object.keys(validation).length > 0 ? validation : undefined;
}

/**
 * Generates a human-readable field label from a field name
 */
function generateFieldLabel(fieldName: string): string {
  return fieldName
    .replaceAll(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Generates form field configurations from a Zod schema
 *
 * This function transforms a Zod object schema into an array of form field
 * configurations that can be used to render dynamic forms. It extracts field
 * types, validation rules, and generates smart labels and placeholders.
 *
 * @param schema - The Zod object schema to convert
 * @returns An array of form field configurations
 *
 * @example
 * ```typescript
 * const fields = generateFormFields(z.object({
 *   name: z.string().min(2),
 *   age: z.number().min(18),
 *   isActive: z.boolean()
 * }));
 * // Returns: [
 * //   { name: "name", type: "text", required: true, validation: { min: 2 } },
 * //   { name: "age", type: "number", required: true, validation: { min: 18 } },
 * //   { name: "isActive", type: "checkbox", required: true }
 * // ]
 * ```
 */
export function generateFormFields(
  schema: z.ZodObject<z.ZodRawShape>
): FormFieldConfig[] {
  const shape = schema.shape as Readonly<Record<string, z.ZodType>>;
  const fields: FormFieldConfig[] = [];

  for (const [fieldName, zodType] of Object.entries(shape)) {
    const fieldType = zodTypeToFieldType(zodType);
    const validation = extractValidationRules(zodType);
    const isOptional =
      zodType.safeParse(undefined).success || zodType.safeParse(null).success;

    const description = zodType.description || undefined;

    // Generate smart placeholders based on field name
    let placeholder: string | undefined;
    if (fieldName.includes("timestamp") || fieldName.includes("time")) {
      placeholder = undefined; // Let datetime inputs handle their own placeholders
    } else if (fieldName.includes("amount") || fieldName.includes("price")) {
      placeholder = "0";
    } else if (fieldName.includes("address")) {
      placeholder = "0x...";
    } else if (fieldName.includes("currency") || fieldName.includes("code")) {
      placeholder = "USD";
    }

    fields.push({
      name: fieldName,
      label: generateFieldLabel(fieldName),
      type: fieldType,
      required: !isOptional,
      description,
      placeholder,
      validation,
    });
  }

  return fields;
}

/**
 * Builds claim data from form values using the appropriate schema
 *
 * This function validates form values against the correct schema and constructs
 * a ClaimData object in the appropriate format. It handles both predefined
 * claims (object format) and custom claims (array format).
 *
 * @param topic - The claim topic name
 * @param values - The form values to validate and transform
 * @param signature - Optional Solidity signature for custom claims
 * @returns A validated ClaimData object, or null if validation fails
 *
 * @example
 * ```typescript
 * const claimData = buildClaimData("assetClassification", {
 *   category: "equity",
 *   subCategory: "stock"
 * });
 * // Returns: { topic: "assetClassification", data: { category: "equity", ... } }
 * ```
 */
export function buildClaimData(
  topic: string,
  values: Record<string, unknown>,
  signature?: string
): ClaimData | null {
  const schema = getSchemaForClaim(topic, signature);
  if (!schema) {
    return null;
  }

  try {
    // Validate form values against the schema
    const validatedData = schema.parse(values);

    // Build the appropriate ClaimData structure
    if (signature) {
      // Custom claim - convert object to array format
      const dataArray = Object.values(validatedData);
      return ClaimDataSchema.parse({
        topic: "custom",
        topicName: topic,
        signature,
        data: dataArray,
      });
    } else {
      // Predefined claim - use object format
      return ClaimDataSchema.parse({
        topic,
        data: validatedData,
      });
    }
  } catch {
    return null;
  }
}
