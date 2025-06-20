/**
 * System Read Handler
 *
 * This handler retrieves detailed information about a specific system contract
 * including all associated token factories. It queries TheGraph to fetch
 * the system's current state and configuration.
 *
 * The handler performs the following operations:
 * 1. Validates user authentication
 * 2. Queries TheGraph for system and token factory data
 * 3. Returns structured system information
 *
 * @see {@link ./system.read.schema} - Input/output validation schemas
 */

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import type { SystemReadOutput } from "./system.read.schema";

/**
 * GraphQL query to fetch system details with token factories.
 *
 * @param id - The system contract address to query
 * @returns System object with token factories
 */
const SYSTEM_DETAILS_QUERY = theGraphGraphql(`
  query SystemDetails($id: ID!) {
    system(id: $id) {
      id
      tokenFactories {
        id
        name
        typeId
      }
    }
  }
`);

/**
 * Reads system contract details including token factories.
 *
 * @auth Required - User must be authenticated
 * @middleware theGraphMiddleware - Provides TheGraph client
 *
 * @param input.id - The system contract address to query
 *
 * @returns System details with associated token factories
 *
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} NOT_FOUND - If system doesn't exist
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * const system = await client.system.read({
 *   id: "0x5e771e1417100000000000000000000000020088"
 * });
 * 
 * console.log(`System ${system.id} has ${system.tokenFactories.length} factories`);
 * 
 * system.tokenFactories.forEach(factory => {
 *   console.log(`${factory.name} (${factory.typeId}): ${factory.id}`);
 * });
 * ```
 */
export const read = onboardedRouter.system.read
  .use(theGraphMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { id } = input;

    // Query system details from TheGraph
    const result = await context.theGraphClient.request(SYSTEM_DETAILS_QUERY, {
      id: id.toLowerCase(), // TheGraph stores addresses in lowercase
    });

    // Check if system exists
    if (!result.system) {
      throw errors.NOT_FOUND({
        message: `System not found: ${id}`,
      });
    }

    // Transform and return the data
    const output: SystemReadOutput = {
      id: result.system.id as `0x${string}`,
      tokenFactories: result.system.tokenFactories.map(factory => ({
        id: factory.id as `0x${string}`,
        name: factory.name,
        typeId: factory.typeId,
      })),
    };

    return output;
  });