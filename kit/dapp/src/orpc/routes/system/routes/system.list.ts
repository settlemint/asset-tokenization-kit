import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { getPagination } from "@/orpc/routes/utils/pagination";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import { z } from "zod/v4";

/**
 * GraphQL query for retrieving SMART systems from TheGraph.
 *
 * This query fetches a paginated list of system contracts with support for:
 * - Offset-based pagination (skip/first)
 * - Configurable sort order (ascending/descending)
 * - Custom ordering by any system field
 *
 * Systems represent deployed SMART protocol instances that manage
 * tokenized assets and their associated compliance infrastructure.
 */
const LIST_SYSTEM_QUERY = theGraphGraphql(`
  query ListSystemQuery($skip: Int!, $first: Int!, $orderBy: System_orderBy = id, $orderDirection: OrderDirection = asc) {
    systems(
        skip: $skip
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
      id
    }
  }
`);

/**
 * System listing route handler.
 *
 * Retrieves a paginated list of SMART system contracts from TheGraph indexer.
 * Systems are the core infrastructure contracts that manage tokenized assets,
 * compliance modules, identity registries, and access control within the SMART
 * protocol ecosystem.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission - available to admin, issuer, user, and auditor roles
 * Method: GET /systems
 * @param input - List parameters including pagination and sorting options
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<System[]> - Array of system objects with their blockchain addresses
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @example
 * ```typescript
 * // Client usage:
 * const systems = await orpc.system.list.query({
 *   offset: 0,
 *   limit: 20,
 *   orderBy: 'deployedAt',
 *   orderDirection: 'desc'
 * });
 * ```
 */
export const list = authRouter.system.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    // Extract and validate pagination parameters from the request
    // Using nullish coalescing for type-safe default values
    const { offset, limit } = getPagination(input);
    const orderBy = input?.orderBy ?? "id";
    const orderDirection = input?.orderDirection ?? "asc";

    // Define response schema for type-safe GraphQL response validation
    // Zod schema provides both runtime validation and TypeScript type inference
    // This ensures the data structure matches our expectations before usage
    const SystemsResponseSchema = z.object({
      systems: z.array(
        z.object({
          id: z.string(),
        })
      ),
    });

    const variables: VariablesOf<typeof LIST_SYSTEM_QUERY> = {
      skip: offset,
      first: limit,
      orderBy: orderBy as VariablesOf<typeof LIST_SYSTEM_QUERY>["orderBy"],
      orderDirection,
    };

    // Execute TheGraph query with type-safe pagination and sorting parameters
    // The Zod schema validates the response and provides proper TypeScript types
    // This eliminates the need for manual type assertions or runtime errors from malformed data
    const result = await context.theGraphClient.query(
      LIST_SYSTEM_QUERY,
      variables,
      SystemsResponseSchema,
      "Failed to retrieve systems"
    );

    // Return the array of system contracts
    return result.systems;
  });
