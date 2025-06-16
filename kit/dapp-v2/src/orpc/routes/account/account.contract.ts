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

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { baseContract } from "../../procedures/base.contract";
import { AccountCreateSchema } from "./routes/account.create.schema";
import { AccountReadSchema, AccountSchema } from "./routes/account.read.schema";

/**
 * Create a wallet account for the authenticated user.
 *
 * This endpoint creates a new wallet for the current authenticated user
 * using the SettleMint HD wallet infrastructure. Each user can only have
 * one wallet address, and attempting to create a second wallet will result
 * in a conflict error.
 *
 * @auth Required - User must be authenticated
 * @method POST
 * @endpoint /account/create
 *
 * @input AccountCreateSchema - User ID for wallet creation
 * @returns string - The created wallet address
 *
 * @throws CONFLICT - If user already has a wallet address
 * @throws PORTAL_ERROR - If wallet creation fails in the portal service
 *
 * @example
 * ```typescript
 * // Create wallet for current user
 * const walletAddress = await client.account.create({
 *   userId: currentUser.id
 * });
 * console.log(`Wallet created: ${walletAddress}`);
 * ```
 */
const create = baseContract
  .route({
    method: "POST",
    path: "/account/create",
    description: "Create a wallet account for the user",
    successDescription: "Wallet address created successfully",
    tags: ["account"],
  })
  .input(AccountCreateSchema)
  .output(ethereumAddress);

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
  .output(AccountSchema);

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
  create,
  read,
  me,
};
