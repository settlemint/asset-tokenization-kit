import { z } from "zod";

/**
 * Ethereum transaction hash validation
 *
 * Transaction hashes are 66 characters long (0x + 64 hex characters)
 * representing the keccak256 hash of the signed transaction data.
 */
export const transactionHash = z
  .string()
  .min(66, "Transaction hash must be at least 66 characters long")
  .max(66, "Transaction hash must be at most 66 characters long")
  .regex(
    /^0x[a-fA-F0-9]{64}$/,
    "Transaction hash must start with 0x followed by 64 hexadecimal characters"
  )
  .brand<"TransactionHash">();

/**
 * Type alias for an Ethereum transaction hash
 */
export type TransactionHash = z.infer<typeof transactionHash>;

/**
 * Get a properly typed transaction hash from a string
 * @param value - The transaction hash string to validate
 * @returns The validated transaction hash
 * @throws {ZodError} If the value is not a valid transaction hash
 */
export function getTransactionHash(value: string): TransactionHash {
  return transactionHash.parse(value);
}

/**
 * Check if a string is a valid transaction hash
 * @param value - The string to check
 * @returns True if the value is a valid transaction hash
 */
export function isTransactionHash(value: string): value is TransactionHash {
  return transactionHash.safeParse(value).success;
}
