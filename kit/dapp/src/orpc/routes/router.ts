import { baseRouter } from "../procedures/base.router";
import accountRouter from "./account/account.router";
import actionsRouter from "./actions/actions.router";
import exchangeRatesRouter from "./exchange-rates/exchange-rates.router";
import settingsRouter from "./settings/settings.router";
import systemRouter from "./system/system.router";
import tokenRouter from "./token/token.router";
import userRouter from "./user/user.router";

/**
 * Main ORPC router configuration.
 *
 * This router serves as the root of the API route tree, organizing all
 * API endpoints into logical namespaces. It uses lazy loading to optimize
 * bundle size and startup performance by only loading route modules when
 * they are actually needed.
 *
 * The router structure follows a hierarchical pattern where each namespace
 * (like 'planet') contains related API procedures, making the API more
 * organized and maintainable.
 */
export const router = baseRouter.router({
  /**
   * Account-related API procedures.
   *
   * Lazy-loaded module containing account management operations.
   * Accounts represent blockchain wallet addresses and their associated
   * identity claims within the ERC-3643 compliance framework. This module
   * provides endpoints for creating wallets and querying account information
   * including verified identity attributes.
   * @see {@link ./account/account.router} - Account router implementation
   */
  account: accountRouter,

  /**
   * Actions-related API procedures.
   *
   * Lazy-loaded module containing actions management operations.
   * Actions represent time-bound, executable tasks that users can perform on assets.
   * This module provides endpoints for listing and reading action details,
   * with automatic filtering to only show actions accessible to the authenticated user.
   *
   * **Architecture Decision**: Actions are implemented as a top-level namespace
   * rather than nested under tokens (e.g., /tokens/{id}/actions) for several reasons:
   * - Actions are domain entities that can target various resources, not just tokens
   * - Provides unified "my actions" view for users across all entities
   * - Enables efficient querying without multiple API calls
   * - Maintains consistent authorization model with centralized user filtering
   * - Future-proof for actions targeting accounts, systems, compliance modules, etc.
   *
   * @see {@link ./actions/actions.router} - Actions router implementation
   */
  actions: actionsRouter,

  /**
   * Exchange rates API procedures.
   *
   * Lazy-loaded module containing foreign exchange rate management operations.
   * Provides real-time currency conversion rates with automatic synchronization
   * from external providers, manual rate overrides, and historical data access
   * for analytics and charting.
   * @see {@link ./exchange-rates/exchange-rates.router} - Exchange rates router implementation
   */
  exchangeRates: exchangeRatesRouter,

  /**
   * Settings-related API procedures.
   *
   * Lazy-loaded module containing settings management operations.
   * @see {@link ./settings/settings.router} - Settings router implementation
   */
  settings: settingsRouter,

  /**
   * Token-related API procedures.
   *
   * Lazy-loaded module containing token management operations.
   * @see {@link ./token/token.router} - Token router implementation
   */
  token: tokenRouter,

  /**
   * System-related API procedures.
   *
   * Lazy-loaded module containing SMART system management operations.
   * Systems are the foundational contracts that orchestrate the deployment
   * and management of tokenized assets, including compliance rules, identity
   * verification, and access control. This module provides endpoints for
   * querying and managing these system contracts.
   * @see {@link ./system/system.router} - System router implementation
   */
  system: systemRouter,

  /**
   * User-related API procedures.
   *
   * Lazy-loaded module containing user-related operations such as
   * querying and managing user-related resources.
   */
  user: userRouter,
});
