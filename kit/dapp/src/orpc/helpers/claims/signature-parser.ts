/**
 * Signature Parser Utility
 *
 * Parses Solidity function signatures used in topic schemes to determine
 * how claim data should be structured and encoded. Supports all common
 * Solidity types used in claim data structures.
 *
 * @example
 * parseSignature("uint256 amount, string currency, uint8 decimals")
 * // Returns: [
 * //   { name: "amount", type: "uint256" },
 * //   { name: "currency", type: "string" },
 * //   { name: "decimals", type: "uint8" }
 * // ]
 */
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

export interface SignatureParameter {
  name: string;
  type: string;
}

/**
 * Cache for parsed signatures to improve performance.
 * Key: signature string, Value: parsed parameters
 */
const signatureCache = new Map<string, SignatureParameter[]>();

/**
 * Maximum number of cached signatures to prevent memory leaks.
 * If exceeded, the cache will be cleared.
 */
const MAX_CACHE_SIZE = 100;

/**
 * Parses a Solidity function signature string into parameter definitions.
 * Results are memoized for performance optimization.
 *
 * @param signature - The signature string (e.g., "uint256 amount, string currency")
 * @returns Array of parameter definitions with name and type
 * @throws {Error} If the signature format is invalid
 */
export function parseSignature(signature: string): SignatureParameter[] {
  // Check cache first
  const cached = signatureCache.get(signature);
  if (cached) {
    return cached;
  }

  // Handle empty signature
  if (!signature || signature.trim() === "") {
    const result: SignatureParameter[] = [];
    signatureCache.set(signature, result);
    return result;
  }

  // Clear cache if it gets too large to prevent memory leaks
  if (signatureCache.size >= MAX_CACHE_SIZE) {
    signatureCache.clear();
  }

  const parameters = signature
    .split(",")
    .map((param) => param.trim())
    .filter((param) => param.length > 0);

  const result = parameters.map((param) => {
    // Match pattern: "type name" or "type[]? name"
    const match = param.match(/^(\w+(?:\[\])?)\s+(\w+)$/);

    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid parameter format: ${param}`);
    }

    const type = match[1];
    const name = match[2];

    // Validate Solidity type
    if (!isValidSolidityType(type)) {
      throw new Error(`Unsupported Solidity type: ${type}`);
    }

    return { name, type };
  });

  // Cache the result
  signatureCache.set(signature, result);
  return result;
}

/**
 * Validates if a string represents a supported Solidity type.
 *
 * @param type - The type string to validate
 * @returns True if the type is supported
 */
function isValidSolidityType(type: string): boolean {
  // Remove array suffix for validation
  const baseType = type.replace(/\[\]$/, "");

  // Supported types
  const supportedTypes = [
    // Integer types
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "uint128",
    "uint256",
    "int8",
    "int16",
    "int32",
    "int64",
    "int128",
    "int256",
    // Aliases
    "uint",
    "int",
    // Other types
    "bool",
    "address",
    "string",
    "bytes",
    // Fixed bytes
    "bytes1",
    "bytes2",
    "bytes4",
    "bytes8",
    "bytes16",
    "bytes32",
  ];

  return supportedTypes.includes(baseType);
}

/**
 * Determines if a Solidity type should be converted from string to bigint.
 * BigInt is used for 64-bit and larger integers to prevent precision loss.
 *
 * @param type - The Solidity type
 * @returns True if the type represents a large integer that requires BigInt
 */
export function shouldConvertToBigInt(type: string): boolean {
  const baseType = type.replace(/\[\]$/, "");
  // Use BigInt for 64-bit and larger integers to prevent precision loss
  // JavaScript's Number.MAX_SAFE_INTEGER is 2^53-1, so we need BigInt for larger values
  return (
    /^u?int(?:64|128|256)?$/.test(baseType) ||
    baseType === "uint" ||
    baseType === "int"
  );
}

/**
 * Converts a value to the appropriate JavaScript type based on Solidity type.
 * Handles both primitive types and arrays with recursive conversion.
 *
 * @param value - The raw value (typically string, primitive, or array)
 * @param type - The target Solidity type (e.g., 'uint256', 'string[]', 'bool')
 * @returns The converted value
 * @throws {Error} If array type validation fails or conversion is not possible
 */
export function convertValue(value: unknown, type: string): unknown {
  // Check for array type (e.g., 'string[]', 'uint256[]')
  const arrayTypeMatch = type.match(/^(.+)\[\]$/);
  if (arrayTypeMatch) {
    const baseType = arrayTypeMatch[1];
    if (!baseType) {
      throw new Error(`Invalid array type: ${type}`);
    }

    if (!Array.isArray(value)) {
      throw new TypeError(
        `Expected array for type ${type}, got ${typeof value}`
      );
    }

    // Recursively convert each array element
    return value.map((element) => convertValue(element, baseType));
  }

  // Handle primitive types
  const baseType = type;

  if (shouldConvertToBigInt(baseType)) {
    try {
      return BigInt(value as string | number | bigint);
    } catch (error) {
      throw new Error(
        `Failed to convert ${value} to BigInt for type ${type}: ${error}`
      );
    }
  }

  if (baseType === "bool") {
    // Handle various boolean representations
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "true" || lower === "1") return true;
      if (lower === "false" || lower === "0") return false;
      throw new Error(`Invalid boolean value: ${value}`);
    }
    if (typeof value === "number") return value !== 0;
    return Boolean(value);
  }

  if (baseType.startsWith("uint") || baseType.startsWith("int")) {
    // Handle various number representations
    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      throw new TypeError(`Invalid number value: ${value} for type ${type}`);
    }

    // Validate ranges for specific integer types
    if (baseType.startsWith("uint") && numValue < 0) {
      throw new Error(
        `Unsigned integer cannot be negative: ${value} for type ${type}`
      );
    }

    return numValue;
  }

  if (baseType === "string" || baseType === "address") {
    return String(value);
  }

  if (baseType.startsWith("bytes")) {
    // Bytes should remain as string (hex format)
    return String(value);
  }

  // For unknown types, return as-is but log a warning (respects logger config)
  if (process.env.NODE_ENV === "development") {
    logger.warn(`Unknown Solidity type: ${type}. Returning value as-is.`);
  }
  return value;
}

/**
 * Clears the signature parsing cache. Useful for testing or memory management.
 * This function is primarily intended for internal use and testing.
 */
export function clearSignatureCache(): void {
  signatureCache.clear();
}

/**
 * Gets the current size of the signature cache. Useful for monitoring and testing.
 * This function is primarily intended for internal use and testing.
 */
export function getSignatureCacheSize(): number {
  return signatureCache.size;
}
