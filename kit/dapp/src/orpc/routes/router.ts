import { baseRouter } from "../procedures/base.router";
import accountRouter from "./account/account.router";
import actionsRouter from "./actions/actions.router";
import exchangeRatesRouter from "./exchange-rates/exchange-rates.router";
import fixedYieldScheduleRouter from "./fixed-yield-schedule/fixed-yield-schedule.router";
import settingsRouter from "./settings/settings.router";
import systemRouter from "./system/system.router";
import tokenRouter from "./token/token.router";
import userRouter from "./user/user.router";

/**
 * Main ORPC router configuration.
 *
 * This router serves as the root of the API route tree, organizing all
 * API endpoints into logical namespaces. All route modules are eagerly loaded
 * to ensure synchronous availability for optimal SSR performance and to avoid
 * async import issues during server-side rendering.
 *
 * The router structure follows a hierarchical pattern where each namespace
 * contains related API procedures, making the API more organized and maintainable.
 */
export const router = baseRouter.router({
  /**
   * Account-related API procedures.
   *
   * Eagerly loaded module containing account management operations.
   * Accounts represent blockchain wallet addresses and their associated
   * identity claims within the ERC-3643 compliance framework.
   */
  account: accountRouter,

  /**
   * Actions-related API procedures.
   *
   * Eagerly loaded module containing actions management operations.
   * Actions represent time-bound, executable tasks that users can perform on assets.
   * This module provides endpoints for listing and reading action details,
   * with automatic filtering to only show actions accessible to the authenticated user.
   *
   * **Architecture Decision**: This router is not lazy-loaded because several other
   * namespaces (for example, the token routes) directly re-use the actions route
   * handlers. Keeping it eagerly loaded prevents circular evaluation issues during
   * the server build that otherwise manifest as `ReferenceError: Cannot access
   * 'router$1' before initialization` when the bundle executes.
   *
   * @see {@link ./actions/actions.router} - Actions router implementation
   */
  actions: actionsRouter,

  /**
   * Exchange rates API procedures.
   *
   * Eagerly loaded module containing foreign exchange rate management operations.
   */
  exchangeRates: exchangeRatesRouter,

  /**
   * Fixed yield schedule API procedures.
   *
   * Eagerly loaded module containing fixed yield schedule management operations.
   */
  fixedYieldSchedule: fixedYieldScheduleRouter,

  /**
   * Settings-related API procedures.
   *
   * The settings router is not lazy-loaded to avoid issues with circular dependencies.
   * The system router calls procedures from the settings router, which sometimes leads to errors (Cannot access 'default' before initialization.)
   * @see {@link ./settings/settings.router} - Settings router implementation
   */
  settings: settingsRouter,

  /**
   * Token-related API procedures.
   *
   * Eagerly loaded module containing token management operations.
   */
  token: tokenRouter,

  /**
   * System-related API procedures.
   *
   * Eagerly loaded module containing SMART system management operations.
   */
  system: systemRouter,

  /**
   * User-related API procedures.
   *
   * Eagerly loaded module containing user-related operations such as
   * querying and managing user-related resources.
   */
  user: userRouter,
});
