import { regex } from "arkregex";

/**
 * Type-safe regex patterns for ABI signature validation
 */
export const WHITESPACE_PATTERN = regex("\\s+", "g");
export const FUNCTION_STYLE_PATTERN = regex("^\\w+\\(");

/**
 * Normalizes ABI type signature by trimming spaces around commas and collapsing multiple spaces
 * Also filters out empty parts from leading/trailing/consecutive commas
 *
 * @param value - Raw ABI type signature string
 * @returns Normalized signature with consistent spacing
 *
 * @example
 * normalizeAbiSignature("string  claim,  uint256") // "string claim, uint256"
 * normalizeAbiSignature("uint256,") // "uint256"
 * normalizeAbiSignature(",string") // "string"
 * normalizeAbiSignature("uint256,,string") // "uint256, string"
 */
export function normalizeAbiSignature(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim().replaceAll(WHITESPACE_PATTERN, " "))
    .filter((part) => part.length > 0)
    .join(", ");
}
