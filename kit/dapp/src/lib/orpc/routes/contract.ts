import { accountContract } from "./account/account.contract";
import { identityContract } from "./identity/identity.contract";
import { systemContract } from "./system/system.contract";
import { transactionContract } from "./transaction/transaction.contract";
import { settingsContract } from "./settings/settings.contract";

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
  account: accountContract,
  
  /**
   * Identity-related API contract.
   *
   * Contains type definitions for identity management procedures.
   * Identities are blockchain-based compliance entities that hold verified
   * claims about users or organizations. This contract provides type-safe
   * access to identity creation and retrieval operations.
   *
   * @see {@link ./identity/identity.contract} - Identity contract implementation
   * @see {@link ./identity/identity.router} - Corresponding router implementation
   */
  identity: identityContract,
  
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
   * Transaction-related API contract.
   *
   * Contains type definitions for transaction-related procedures.
   *
   * @see {@link ./transaction/transaction.contract} - Transaction contract implementation
   * @see {@link ./transaction/transaction.router} - Corresponding router implementation
   */
  transaction: transactionContract,

  /**
   * Settings-related API contract.
   *
   * Contains type definitions for application settings management procedures.
   * Settings provide a flexible key-value store for application configuration
   * with support for CRUD operations and type-safe access to predefined keys.
   *
   * @see {@link ./settings/settings.contract} - Settings contract implementation
   * @see {@link ./settings/settings.router} - Corresponding router implementation
   */
  settings: settingsContract,
};
