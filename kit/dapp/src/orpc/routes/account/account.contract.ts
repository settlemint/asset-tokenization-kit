/**
 * Account Management Contract
 *
 * This contract defines the type-safe interfaces for account-related operations.
 * It provides endpoints for creating and reading account information, particularly
 * focusing on wallet creation and identity claims management.
 *
 * All endpoints in this contract require authentication, ensuring that account
 * data is properly protected and only accessible to authorized users.
 *
 * @see {@link @/orpc/procedures/auth.contract} - Base authenticated contract
 * @see {@link ./account.router} - Implementation router
 */

import { baseContract } from "../../procedures/base.contract";
import { AccountReadSchema, AccountSchema } from "./routes/account.read.schema";

/**
 * Read account information including identity claims.
 *
 * This endpoint retrieves comprehensive account information from TheGraph,
 * including the account's identity claims and their verification status.
 * Identity claims are part of the ERC-3643 compliance system and contain
 * key-value pairs that represent verified attributes about the account holder.
 *
 * @auth Required - User must be authenticated
 * @method GET
 * @endpoint /account/read
 *
 * @input AccountReadSchema - Wallet address to query
 * @returns AccountSchema - Account information including identity claims
 *
 * @throws ORPCError - If account is not found
 *
 * @example
 * ```typescript
 * // Read account information
 * const account = await client.account.read({
 *   walletAddress: "0x1234567890123456789012345678901234567890"
 * });
 *
 * // Check identity claims
 * if (account.identity) {
 *   account.identity.claims.forEach(claim => {
 *     console.log(`Claim: ${claim.name}, Revoked: ${claim.revoked}`);
 *     claim.values.forEach(value => {
 *       if (value) {
 *         console.log(`  ${value.key}: ${value.value}`);
 *       }
 *     });
 *   });
 * }
 * ```
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/account/read",
    description: "Read account information including identity claims",
    successDescription: "Account information retrieved successfully",
    tags: ["account"],
  })
  .input(AccountReadSchema)
  .output(AccountSchema);

const me = baseContract
  .route({
    method: "GET",
    path: "/account/me",
    description: "Read account information for the authenticated user",
    successDescription: "Account information retrieved successfully",
    tags: ["account"],
  })
  .output(AccountSchema.nullable());

/**
 * Account API contract collection.
 *
 * Exports all account-related API contracts for use in the main contract registry.
 * Currently includes:
 * - create: Create a wallet for the authenticated user
 * - read: Retrieve account information and identity claims
 *
 * Future endpoints may include:
 * - update: Update account identity claims
 * - delete: Remove account (with proper safeguards)
 * - list: List all accounts (admin only)
 * - verify: Verify identity claims
 */
export const accountContract = {
  read,
  me,
};
