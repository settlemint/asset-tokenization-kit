/**
 * Account Management Contract
 *
 * This contract defines the type-safe interfaces for account-related operations.
 * Currently focused on account search functionality.
 *
 * Note: Identity-related functionality has been moved to the system.identity namespace.
 * @see {@link @/orpc/procedures/auth.contract} - Base authenticated contract
 * @see {@link ./account.router} - Implementation router
 * @see {@link @/orpc/routes/system/identity/identity.contract} - Identity operations
 */

import { accountSearchContract } from "@/orpc/routes/account/routes/account.search.contract";

/**
 * Account API contract collection.
 *
 * Exports all account-related API contracts for use in the main contract registry.
 * Currently includes:
 * - search: Search accounts by various criteria
 *
 * Note: Identity-related functionality (read, me) has been moved to system.identity namespace.
 */
export const accountContract = {
  search: accountSearchContract,
};
