import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { authRouter } from "@/orpc/procedures/auth.router";
import { FactoriesResponseSchema } from "@/orpc/routes/system/token-factory/routes/factory.list.schema";

/**
 * GraphQL query for retrieving token factories from TheGraph.
 *
 * Token factories are smart contracts that enable the creation of new tokenized assets.
 * Each factory can produce tokens of a specific type (e.g., equity tokens, bonds, funds).
 *
 * This query supports:
 * - Automatic pagination using @fetchAll directive
 * - Flexible sorting by any TokenFactory field
 * - Filtering based on whether factories have created tokens
 *
 * The hasTokens field enables efficient filtering without expensive joins,
 * allowing UIs to show only active factories or hide empty ones.
 */
const LIST_TOKEN_FACTORIES_QUERY = theGraphGraphql(`
  query ListTokenFactories($orderBy: TokenFactory_orderBy, $orderDirection: OrderDirection, $where: TokenFactory_filter) {
    tokenFactories(
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) @fetchAll {
      id
      name
      typeId
      hasTokens
      tokenExtensions
    }
  }
`);

/**
 * Token factory listing route handler.
 *
 * Retrieves a paginated list of token factories with optional filtering
 * based on whether they have created tokens. This endpoint is designed
 * to support UI components that need to display factory lists, such as
 * navigation sidebars or factory selection dropdowns.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on token factories
 * Method: GET /token/factories
 *
 * @param input - List parameters including pagination, sorting, and optional hasTokens filter
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<TokenFactory[]> - Array of token factory objects
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all token factories (default pagination)
 * const factories = await orpc.system.tokenFactoryList.query({});
 *
 * // Get only factories that have created tokens
 * const activeFactories = await orpc.system.tokenFactoryList.query({
 *   hasTokens: true
 * });
 *
 * // Get empty factories, sorted by name
 * const emptyFactories = await orpc.system.tokenFactoryList.query({
 *   hasTokens: false,
 *   orderBy: 'name',
 *   orderDirection: 'asc'
 * });
 *
 * // Paginated retrieval (page 2, 50 items per page)
 * const page2 = await orpc.system.tokenFactoryList.query({
 *   offset: 50,
 *   limit: 50
 * });
 * ```
 */
export const factoryList = authRouter.system.tokenFactoryList.handler(
  async ({ input, context }) => {
    // Build where clause if hasTokens filter is provided
    const where =
      input.hasTokens === undefined
        ? undefined
        : { hasTokens: input.hasTokens };

    const response = await context.theGraphClient.query(
      LIST_TOKEN_FACTORIES_QUERY,
      {
        input: {
          ...input,
          where,
        },
        output: FactoriesResponseSchema,
      }
    );

    return response.tokenFactories;
  }
);
