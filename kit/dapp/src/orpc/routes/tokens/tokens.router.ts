/**
 * Tokens Router
 *
 * This router handles all token-related operations in the SettleMint platform.
 * It provides endpoints for creating and managing token factories for various
 * asset types including bonds, equity, funds, stablecoins, and deposits.
 *
 * The router is organized into namespaces:
 * - factory: Operations related to token factory contracts
 *
 * All routes in this router require authentication and appropriate permissions.
 *
 * @example
 * ```typescript
 * // Import and use in main router
 * import { tokensRouter } from "./tokens/tokens.router";
 *
 * export const appRouter = router({
 *   tokens: tokensRouter,
 *   // ... other routers
 * });
 * ```
 */

import { factoryCreate } from "./routes/factory.create";

/**
 * Main tokens router
 *
 * Exported router that combines all token-related namespaces
 */
const routes = {
  factoryCreate,
};

export default routes;
