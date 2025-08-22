import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod";
import { TokenFactoryDetailSchema } from "./factory.read.schema";

/**
 * GraphQL query for retrieving a single token factory by ID.
 *
 * Fetches detailed information about a specific token factory contract.
 * Token factories are used to deploy new tokenized assets with predefined
 * properties and compliance rules based on their type.
 *
 * @remarks
 * The ID parameter must be a valid Ethereum address (contract address)
 * of a deployed token factory. TheGraph requires lowercase addresses,
 * which is handled automatically by the transform function.
 */
const READ_TOKEN_FACTORY_QUERY = theGraphGraphql(`
  query ReadTokenFactory($id: ID!) {
    tokenFactory(id: $id) {
      id
      name
      typeId
    }
  }
`);

/**
 * Token factory read route handler.
 *
 * Retrieves detailed information about a specific token factory by its
 * contract address. This endpoint is used when displaying factory details,
 * configuring new token deployments, or validating factory existence.
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "read" permission on token factories
 * Method: GET /token/factory/:id
 *
 * @param input - Object containing the factory ID (contract address)
 * @param context - Request context with TheGraph client and authenticated user
 * @returns Promise<TokenFactory | null> - Factory details or null if not found
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions
 * @throws NOT_FOUND - If the specified factory does not exist
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Read a specific token factory
 * const factory = await orpc.system.factory.read.query({
 *   id: '0x1234567890abcdef1234567890abcdef12345678'
 * });
 *
 * if (factory) {
 *   console.log(`Factory: ${factory.name} (Type: ${factory.typeId})`);
 * }
 * ```
 *
 * @see {@link TokenFactoryDetailSchema} for the response structure
 */
export const factoryRead = authRouter.system.factory.read
  .use(theGraphMiddleware)
  .handler(async ({ input, context }) => {
    const result = await context.theGraphClient.query(
      READ_TOKEN_FACTORY_QUERY,
      {
        input: {
          id: input.id.toLowerCase(), // The Graph uses lowercase addresses
        },
        output: z.object({
          tokenFactory: TokenFactoryDetailSchema,
        }),
      }
    );
    return result.tokenFactory;
  });
