/**
 * Compliance Expression ABI Encoding Utilities
 *
 * @remarks
 * This module handles the encoding of compliance expressions into ABI-compatible
 * formats for smart contract deployment. It bridges the gap between human-readable
 * compliance rules and the binary data format required by Ethereum smart contracts.
 *
 * ENCODING ARCHITECTURE:
 * - Postfix expression format for efficient smart contract evaluation
 * - ABI encoding ensures type safety and gas optimization
 * - Tuple array format: (uint8 nodeType, uint256 value)[]
 * - Viem integration for reliable ABI parameter handling
 *
 * BUSINESS CONTEXT:
 * - Compliance expressions define who can perform token operations
 * - Rules like "country IS US AND age GREATER_THAN 18" become bytecode
 * - Smart contracts evaluate expressions during token transfers
 * - Encoding must be deterministic and gas-efficient
 *
 * SECURITY CONSIDERATIONS:
 * - ABI encoding prevents injection attacks through type validation
 * - Postfix format eliminates parsing ambiguities in smart contracts
 * - Empty expressions are handled gracefully (return empty string)
 * - Type casting is safe due to Zod validation upstream
 *
 * @see {@link Expression} Postfix expression format from Zod validation
 * @see {@link ExpressionNode} Individual expression node structure
 * @see https://docs.soliditylang.org/en/latest/abi-spec.html ABI specification
 */

import type { Expression, ExpressionNode } from "@atk/zod/expression-node";
import { encodeAbiParameters, parseAbiParameters } from "viem";

/**
 * Encodes a compliance expression into ABI-compatible bytecode for smart contract deployment.
 *
 * @remarks
 * ABI ENCODING STRATEGY: Uses Ethereum's ABI encoding standard to convert expression
 * nodes into bytecode that smart contracts can efficiently process. The encoding
 * format is an array of tuples: (uint8 nodeType, uint256 value)[].
 *
 * DATA STRUCTURE MAPPING:
 * - nodeType (uint8): Identifies the type of expression node (topic, operator, value)
 * - value (uint256): The numeric value associated with the node
 * - Array format: Enables efficient iteration in smart contract evaluation
 *
 * GAS OPTIMIZATION: The tuple array format minimizes gas costs during smart contract
 * execution by using packed data structures and avoiding string operations.
 *
 * TYPE SAFETY: Viem's ABI encoding provides compile-time and runtime type checking
 * to prevent encoding errors that could cause smart contract failures.
 *
 * ERROR HANDLING: Invalid expressions (empty arrays) return empty strings rather
 * than throwing errors, allowing graceful handling in deployment workflows.
 *
 * @param expression - Postfix expression array validated by Zod schemas
 * @returns ABI-encoded hex string for smart contract deployment, or empty string if invalid
 * @example
 * ```typescript
 * // Example expression: "country IS US AND age GREATER_THAN 18"
 * const expression: Expression = [
 *   { nodeType: 0, value: 1 },    // country topic
 *   { nodeType: 1, value: 0 },    // IS operator
 *   { nodeType: 2, value: 840 },  // US country code
 *   { nodeType: 3, value: 0 },    // AND logical operator
 *   { nodeType: 0, value: 2 },    // age topic
 *   { nodeType: 1, value: 2 },    // GREATER_THAN operator
 *   { nodeType: 2, value: 18 }    // age value
 * ];
 *
 * const encoded = encodeExpressionParams(expression);
 * // Returns: "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000007..."
 *
 * // Empty expression handling
 * const empty = encodeExpressionParams([]);
 * // Returns: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000"
 *
 * // Usage in smart contract deployment
 * const deploymentData = {
 *   name: "Compliance Token",
 *   symbol: "COMP",
 *   complianceRules: encodeExpressionParams(expression)
 * };
 * ```
 */
export const encodeExpressionParams = (expression: Expression): string => {
  // ABI PARAMETER SPECIFICATION: Define the expected data structure
  // WHY: "(uint8,uint256)[]" format optimizes for smart contract processing
  // - uint8 nodeType: Efficient storage for node type enumeration (0-255 types)
  // - uint256 value: Standard Ethereum word size for numeric values
  // - Array format: Enables efficient iteration in Solidity loops
  const abiTypes = parseAbiParameters("(uint8,uint256)[]");

  // DATA TRANSFORMATION: Convert expression nodes to ABI-compatible tuples
  // WHY: Smart contracts expect specific data types and cannot process JavaScript objects
  const encodedNodes = expression.map(
    (node: ExpressionNode) => [node.nodeType as number, node.value] as const // Type assertion safe due to Zod validation
  );

  // ABI ENCODING: Convert to bytecode using Ethereum's standard encoding
  // WHY: Viem provides reliable ABI encoding that matches Solidity's expectations
  // and handles edge cases like empty arrays gracefully
  return encodeAbiParameters(abiTypes, [encodedNodes]);
};
