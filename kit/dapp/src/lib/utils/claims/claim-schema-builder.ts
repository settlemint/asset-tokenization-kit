import type { ClaimData } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { ClaimDataSchema } from "@/orpc/routes/system/identity/claims/routes/claims.issue.schema";
import { z } from "zod";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "bigint"
  | "boolean"
  | "checkbox"
  | "datetime"
  | "select";

/**
 * Extracts the Zod schema for a predefined claim topic from ClaimDataSchema
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
 * Maps Solidity types to Zod schemas
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
 * Example: "claim(string value, uint256 amount)" → Zod schema with string and number fields
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
 * First tries predefined schemas, then falls back to signature parsing
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
 * Converts a Zod type to a form field type
 */
function zodTypeToFieldType(zodType: z.ZodType): FormFieldType {
  if (zodType instanceof z.ZodString) {
    return "text";
  }

  if (zodType instanceof z.ZodNumber) {
    return "number";
  }

  if (zodType instanceof z.ZodBoolean) {
    return "checkbox";
  }

  if (zodType instanceof z.ZodDate) {
    return "datetime";
  }

  if (zodType instanceof z.ZodEnum) {
    return "select";
  }

  if (zodType instanceof z.ZodOptional) {
    return zodTypeToFieldType(zodType.unwrap() as z.ZodType);
  }

  if (zodType instanceof z.ZodNullable) {
    return zodTypeToFieldType(zodType.unwrap() as z.ZodType);
  }

  return "text";
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to build claim data for topic "${topic}":`, error);
    return null;
  }
}
