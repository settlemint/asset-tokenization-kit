import { accountContract } from "@/orpc/routes/account/account.contract";
import { actionsContract } from "@/orpc/routes/actions/actions.contract";
import { exchangeRatesContract } from "@/orpc/routes/exchange-rates/exchange-rates.contract";
import { fixedYieldScheduleContract } from "@/orpc/routes/fixed-yield-schedule/fixed-yield-schedule.contract";
import { settingsContract } from "@/orpc/routes/settings/settings.contract";
import { systemContract } from "@/orpc/routes/system/system.contract";
import { tokenContract } from "@/orpc/routes/token/token.contract";
import { userContract } from "@/orpc/routes/user/user.contract";

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
   * @see {@link ./account/account.contract} - Account contract implementation
   * @see {@link ./account/account.router} - Corresponding router implementation
   */
  account: accountContract,

  /**
   * Actions-related API contract.
   *
   * Contains type definitions for actions management procedures.
   * Actions represent time-bound, executable tasks that users can perform on assets.
   * This contract provides type-safe access to action listing and details operations,
   * with automatic filtering to only show actions accessible to the authenticated user.
   * @see {@link ./actions/actions.contract} - Actions contract implementation
   * @see {@link ./actions/actions.router} - Corresponding router implementation
   */
  actions: actionsContract,

  /**
   * Exchange rates API contract.
   *
   * Contains type definitions for foreign exchange rate management procedures.
   * Provides real-time currency conversion rates with automatic synchronization
   * from external providers, manual rate overrides, and historical data access
   * for analytics and charting.
   * @see {@link ./exchange-rates/exchange-rates.contract} - Exchange rates contract implementation
   * @see {@link ./exchange-rates/exchange-rates.router} - Corresponding router implementation
   */
  exchangeRates: exchangeRatesContract,

  /**
   * Fixed yield schedule API contract.
   *
   * Contains type definitions for fixed yield schedule management procedures.
   * Provides access to yield schedule configuration, tracking metrics, period
   * management, and denomination asset details for tokenized assets with
   * yield-bearing capabilities.
   * @see {@link ./fixed-yield-schedule/fixed-yield-schedule.contract} - Fixed yield schedule contract implementation
   * @see {@link ./fixed-yield-schedule/fixed-yield-schedule.router} - Corresponding router implementation
   */
  fixedYieldSchedule: fixedYieldScheduleContract,

  /**
   * Settings-related API contract.
   *
   * Contains type definitions for settings management procedures.
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
   * @see {@link ./system/system.contract} - System contract implementation
   * @see {@link ./system/system.router} - Corresponding router implementation
   */
  system: systemContract,

  /**
   * Token-related API contract.
   *
   * Contains type definitions for token-related procedures.
   * @see {@link ./token/token.contract} - Token contract implementation
   * @see {@link ./token/token.router} - Corresponding router implementation
   */
  token: tokenContract,

  /**
   * User-related API contract.
   *
   * Contains type definitions for user-related procedures.
   * @see {@link ./user/user.contract} - User contract implementation
   * @see {@link ./user/user.router} - Corresponding router implementation
   */
  user: userContract,
};
