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
 * @see {@link ./system.read.schema} - Input/output validation schemas
 */

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { z } from "zod";
import type { SystemReadOutput } from "./system.read.schema";

/**
 * GraphQL query to fetch system details with token factories.
 * @param id - The system contract address to query
 * @returns System object with token factories
 */
const SYSTEM_DETAILS_QUERY = theGraphGraphql(`
  query SystemDetails($id: ID!) {
    system(id: $id) {
      id
      deployedInTransaction
      identityRegistry {
        id
      }
      trustedIssuersRegistry {
        id
      }
      compliance {
        id
      }
      tokenFactoryRegistry {
        id
        tokenFactories {
          id
          name
          typeId
        }
      }
      systemAddonRegistry {
        id
      }
    }
  }
`);

/**
 * Reads system contract details including token factories.
 * @auth Required - User must be authenticated and onboarded
 * @middleware theGraphMiddleware - Provides TheGraph client
 * @param input.id - The system contract address to query
 * @returns System details with associated token factories
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @throws {ORPCError} NOT_ONBOARDED - If user hasn't completed onboarding
 * @throws {ORPCError} NOT_FOUND - If system doesn't exist
 * @throws {ORPCError} INTERNAL_SERVER_ERROR - If TheGraph query fails
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
    // Define response schema for type-safe validation
    // This Zod schema ensures the GraphQL response matches our expected structure
    // and provides compile-time type inference for the validated data
    const SystemResponseSchema = z.object({
      system: z
        .object({
          id: z.string(),
          deployedInTransaction: z.string().nullable(),
          identityRegistry: z
            .object({
              id: z.string(),
            })
            .nullable(),
          trustedIssuersRegistry: z
            .object({
              id: z.string(),
            })
            .nullable(),
          compliance: z
            .object({
              id: z.string(),
            })
            .nullable(),
          tokenFactoryRegistry: z
            .object({
              id: z.string(),
              tokenFactories: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  typeId: z.string(),
                })
              ),
            })
            .nullable(),
          systemAddonRegistry: z
            .object({
              id: z.string(),
            })
            .nullable(),
        })
        .nullable(),
    });

    // Query system details from TheGraph with automatic ID transformation
    const result = await context.theGraphClient.query(SYSTEM_DETAILS_QUERY, {
      input: {
        id: input.id.toLowerCase(), // TheGraph stores addresses in lowercase
      },
      output: SystemResponseSchema,
      error: `Failed to retrieve system: ${input.id}`,
    });

    // Check if system exists
    if (!result.system) {
      throw errors.NOT_FOUND({
        message: `System not found: ${input.id}`,
      });
    }

    // Transform and return the data with proper type casting
    // The EthereumAddress type assertions ensure type safety for blockchain addresses
    // The factory mapping no longer needs explicit type annotations thanks to Zod inference
    const output: SystemReadOutput = {
      id: result.system.id as EthereumAddress,
      deployedInTransaction: result.system.deployedInTransaction,
      identityRegistry: result.system.identityRegistry?.id as EthereumAddress,
      trustedIssuersRegistry: result.system.trustedIssuersRegistry
        ?.id as EthereumAddress,
      compliance: result.system.compliance?.id as EthereumAddress,
      tokenFactoryRegistry: result.system.tokenFactoryRegistry
        ?.id as EthereumAddress,
      systemAddonRegistry: result.system.systemAddonRegistry
        ?.id as EthereumAddress,
      tokenFactories:
        result.system.tokenFactoryRegistry?.tokenFactories.map((factory) => ({
          id: factory.id as EthereumAddress,
          name: factory.name,
          typeId: factory.typeId,
        })) ?? [],
    };

    return output;
  });
