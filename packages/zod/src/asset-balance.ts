/**
 * Asset Balance Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for asset balance
 * information used across token holder queries and responses, ensuring consistent
 * data structure and validation across the application.
 * @module AssetBalanceValidation
 */
import * as z from "zod";
import { bigDecimal } from "./bigdecimal";
import { ethereumAddress } from "./ethereum-address";
import { timestamp } from "./timestamp";

/**
 * Zod schema for validating account information within asset balance
 *
 * This schema provides validation for account data with the following features:
 * - Ethereum address validation for account ID
 * - Type-safe account structure
 * - Reusable across different balance contexts
 *
 * @example
 * ```typescript
 * const accountData = assetBalanceAccount().parse({
 *   id: "0x742d35cc6635c0532925a3b8d61d78f51b5c1234"
 * });
 * ```
 */
export const assetBalanceAccount = () =>
  z.object({
    id: ethereumAddress.describe("The address of the account holder"),
  });

/**
 * Zod schema for validating complete asset balance information
 *
 * This schema provides comprehensive validation for asset balances with the following features:
 * - Account information with validated Ethereum address
 * - Available balance amount validation using bigDecimal
 * - Frozen balance amount validation
 * - Freeze status boolean flag
 * - Total balance value calculation
 * - Last updated timestamp for tracking balance changes
 * - Type-safe balance structure
 * - Reusable across token holder endpoints
 *
 * Balance structure requirements:
 * - account: Must contain valid Ethereum address as id
 * - available: Available balance for transfers (bigDecimal)
 * - frozen: Frozen/locked balance amount (bigDecimal)
 * - isFrozen: Boolean indicating if the entire balance is frozen
 * - value: Total balance value (available + frozen) (bigDecimal)
 * - lastUpdatedAt: Timestamp when the balance was last updated
 *
 * The validation process follows these steps:
 * 1. Validate account structure with Ethereum address
 * 2. Validate all balance amounts as bigDecimal values
 * 3. Validate freeze status as boolean
 * 4. Validate timestamp for last update
 * 5. Return as validated AssetBalance type
 *
 * @example
 * ```typescript
 * // Valid asset balance parsing
 * const balance = assetBalance().parse({
 *   account: {
 *     id: "0x742d35cc6635c0532925a3b8d61d78f51b5c1234"
 *   },
 *   available: [1000n, 18],
 *   frozen: [500n, 18],
 *   isFrozen: false,
 *   value: [1500n, 18],
 *   lastUpdatedAt: new Date("2024-01-15T10:30:00Z")
 * });
 *
 * // Safe parsing with error handling
 * const result = assetBalance().safeParse(balanceData);
 * if (result.success) {
 *   console.log(result.data); // Valid balance
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Type guard usage
 * if (isAssetBalance(userInput)) {
 *   // TypeScript knows userInput is AssetBalance
 *   console.log(`Account: ${userInput.account.id}`);
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const assetBalance = () =>
  z.object({
    account: assetBalanceAccount(),
    available: bigDecimal().describe("Available balance amount for transfers"),
    frozen: bigDecimal().describe("Frozen/locked balance amount"),
    isFrozen: z.boolean().describe("Whether the entire balance is frozen"),
    value: bigDecimal().describe("Total balance value (available + frozen)"),
    lastUpdatedAt: timestamp().describe("Last time the balance was updated"),
  });

/**
 * Type representing a validated asset balance account
 */
export type AssetBalanceAccount = z.infer<
  ReturnType<typeof assetBalanceAccount>
>;

/**
 * Type representing a validated asset balance
 */
export type AssetBalance = z.infer<ReturnType<typeof assetBalance>>;

/**
 * Type guard function to check if a value is a valid asset balance
 *
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid asset balance, `false` otherwise
 */
export function isAssetBalance(value: unknown): value is AssetBalance {
  return assetBalance().safeParse(value).success;
}

/**
 * Safely parse and validate an asset balance with error throwing
 *
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated asset balance
 * @throws {Error} When the input fails validation
 */
export function getAssetBalance(value: unknown): AssetBalance {
  return assetBalance().parse(value);
}
