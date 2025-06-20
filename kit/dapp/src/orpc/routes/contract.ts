import { settingsContract } from "@/orpc/routes/settings/settings.contract";
import { userContract } from "@/orpc/routes/user/user.contract";
import { accountContract } from "./account/account.contract";
import { systemContract } from "./system/system.contract";
import { tokensContract } from "./tokens/tokens.contract";

/**
 * Main ORPC contract definition.
 *
 * This contract serves as the type-safe API specification that defines the
 * structure and types for all available API procedures. It acts as a bridge
 * between the server-side router implementation and the client-side usage,
 * ensuring full TypeScript type safety across the entire API surface.
 *
 * The contract is used by:
 * - Client-side code for type-safe API calls and auto-completion
 * - OpenAPI documentation generation
 * - Runtime validation of requests and responses
 * - Development-time type checking and IntelliSense
 *
 * Each namespace in the contract corresponds to a router module and contains
 * the type definitions for all procedures within that namespace.
 */
export const contract = {
  /**
   * Account-related API contract.
   *
   * Contains type definitions for account management procedures.
   * Accounts represent blockchain wallet addresses with associated identity
   * claims in the ERC-3643 compliance system. This contract provides type-safe
   * access to wallet creation and account information retrieval operations.
   *
   * @see {@link ./account/account.contract} - Account contract implementation
   * @see {@link ./account/account.router} - Corresponding router implementation
   */
  account: accountContract,

  /**
   * Settings-related API contract.
   *
   * Contains type definitions for settings management procedures.
   *
   * @see {@link ./settings/settings.contract} - Settings contract implementation
   * @see {@link ./settings/settings.router} - Corresponding router implementation
   */
  settings: settingsContract,

  /**
   * System-related API contract.
   *
   * Contains type definitions for SMART system management procedures.
   * Systems are the core entities that manage the lifecycle and compliance
   * of tokenized assets on the blockchain. This contract provides type-safe
   * access to system listing and management operations.
   *
   * @see {@link ./system/system.contract} - System contract implementation
   * @see {@link ./system/system.router} - Corresponding router implementation
   */
  system: systemContract,

  /**
   * User-related API contract.
   *
   * Contains type definitions for user-related procedures.
   *
   * @see {@link ./user/user.contract} - User contract implementation
   * @see {@link ./user/user.router} - Corresponding router implementation
   */
  user: userContract,

  /**
   * Token-related API contract.
   *
   * Contains type definitions for token factory management procedures.
   * Token factories are the foundation for creating tokenized assets including
   * bonds, equity, funds, stablecoins, and deposits. This contract provides
   * type-safe access to factory creation and management operations.
   *
   * @see {@link ./tokens/tokens.contract} - Tokens contract implementation
   * @see {@link ./tokens/tokens.router} - Corresponding router implementation
   */
  tokens: tokensContract,
};
