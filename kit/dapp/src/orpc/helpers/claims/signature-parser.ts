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

export interface SignatureParameter {
  name: string;
  type: string;
}

/**
 * Parses a Solidity function signature string into parameter definitions.
 *
 * @param signature - The signature string (e.g., "uint256 amount, string currency")
 * @returns Array of parameter definitions with name and type
 * @throws {Error} If the signature format is invalid
 */
export function parseSignature(signature: string): SignatureParameter[] {
  // Handle empty signature
  if (!signature || signature.trim() === "") {
    return [];
  }

  const parameters = signature
    .split(",")
    .map((param) => param.trim())
    .filter((param) => param.length > 0);

  return parameters.map((param) => {
    // Match pattern: "type name" or "type[]? name"
    const match = param.match(/^(\w+(?:\[\])?)\s+(\w+)$/);
    
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid parameter format: ${param}`);
    }

    const type = match[1]!;
    const name = match[2]!;
    
    // Validate Solidity type
    if (!isValidSolidityType(type)) {
      throw new Error(`Unsupported Solidity type: ${type}`);
    }

    return { name, type };
  });
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
    "uint8", "uint16", "uint32", "uint64", "uint128", "uint256",
    "int8", "int16", "int32", "int64", "int128", "int256",
    // Aliases
    "uint", "int",
    // Other types
    "bool", "address", "string", "bytes",
    // Fixed bytes
    "bytes1", "bytes2", "bytes4", "bytes8", "bytes16", "bytes32",
  ];

  return supportedTypes.includes(baseType);
}

/**
 * Determines if a Solidity type should be converted from string to bigint.
 *
 * @param type - The Solidity type
 * @returns True if the type represents a large integer
 */
export function shouldConvertToBigInt(type: string): boolean {
  const baseType = type.replace(/\[\]$/, "");
  return /^u?int(?:128|256)?$/.test(baseType);
}

/**
 * Converts a value to the appropriate JavaScript type based on Solidity type.
 *
 * @param value - The raw value (typically string or primitive)
 * @param type - The target Solidity type
 * @returns The converted value
 */
export function convertValue(value: unknown, type: string): unknown {
  const baseType = type.replace(/\[\]$/, "");

  if (shouldConvertToBigInt(baseType)) {
    return BigInt(value as string | number | bigint);
  }

  if (baseType === "bool") {
    return Boolean(value);
  }

  if (baseType.startsWith("uint") || baseType.startsWith("int")) {
    return Number(value);
  }

  // String, address, bytes - return as-is
  return value;
}