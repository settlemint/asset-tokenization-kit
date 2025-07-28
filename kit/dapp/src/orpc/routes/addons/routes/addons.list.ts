import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { AddonsResponseSchema } from "@/orpc/routes/addons/routes/addons.list.schema";

/**
 * GraphQL query for retrieving system addons from TheGraph.
 *
 * System addons are modular smart contracts that extend token functionality
 * with features like airdrops, yield distribution, and XVP settlements.
 *
 * This query supports:
 * - Paginated retrieval using skip/first parameters
 * - Flexible sorting by any SystemAddon field
 * - Filtering by addon type (airdrops, yield, xvp)
 * - Filtering by account address (who deployed the addon)
 *
 * The typeId field allows filtering for specific addon capabilities,
 * while account filtering enables finding addons deployed by specific users.
 */
const LIST_SYSTEM_ADDONS_QUERY = theGraphGraphql(`
  query ListSystemAddons($skip: Int!, $first: Int!, $orderBy: SystemAddon_orderBy, $orderDirection: OrderDirection, $where: SystemAddon_filter) {
    systemAddons(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      name
      typeId
      deployedInTransaction
      account {
        id
      }
    }
  }
`);

/**
 * System addon listing route handler.
 *
 * Retrieves a paginated list of system addons with optional filtering
 * by type and deploying account. This endpoint is designed to support
 * UI components that need to display addon lists, such as addon management
 * interfaces or token configuration screens.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on system addons
 * Method: GET /addons
 *
 * @param input - List parameters including pagination, sorting, and optional filters
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<SystemAddon[]> - Array of system addon objects
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all system addons (default pagination)
 * const addons = await orpc.addons.list.query({});
 *
 * // Get only airdrop addons
 * const airdropAddons = await orpc.addons.list.query({
 *   typeId: "airdrops"
 * });
 *
 * // Get addons deployed by a specific account
 * const userAddons = await orpc.addons.list.query({
 *   account: "0x1234..."
 * });
 *
 * // Get yield addons, sorted by name
 * const yieldAddons = await orpc.addons.list.query({
 *   typeId: "yield",
 *   orderBy: "name",
 *   orderDirection: "asc"
 * });
 *
 * // Paginated retrieval (page 2, 50 items per page)
 * const page2 = await orpc.addons.list.query({
 *   offset: 50,
 *   limit: 50
 * });
 * ```
 */
export const addonsList = authRouter.addons.list
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    // Build where clause based on filters
    const where: Record<string, unknown> = {};

    if (input.typeId !== undefined) {
      where.typeId = input.typeId;
    }

    if (input.account !== undefined) {
      where.account = input.account.toLowerCase();
    }

    const response = await context.theGraphClient.query(
      LIST_SYSTEM_ADDONS_QUERY,
      {
        input: {
          ...input,
          where: Object.keys(where).length > 0 ? where : undefined,
        },
        output: AddonsResponseSchema,
        error: "Failed to list system addons",
      }
    );

    // Transform the response to match the schema with hoisted account address
    return response.systemAddons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      typeId: addon.typeId,
      deployedInTransaction: addon.deployedInTransaction,
      account: getEthereumAddress(addon.account.id),
    }));
  });
