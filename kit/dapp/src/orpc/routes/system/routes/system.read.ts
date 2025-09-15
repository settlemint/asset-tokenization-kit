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

import { getSystemContext } from "@/orpc/middlewares/system/system.middleware";
import { publicRouter } from "@/orpc/procedures/public.router";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import type { SystemReadOutput } from "@/orpc/routes/system/routes/system.read.schema";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { call } from "@orpc/server";

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
export const read = publicRouter.system.read.handler(
  async ({ input, context, errors }) => {
    // Query system details from TheGraph with automatic ID transformation
    const systemAddress =
      input.id === "default"
        ? await call(
            settingsRead,
            {
              key: "SYSTEM_ADDRESS",
            },
            {
              context,
            }
          )
        : input.id;
    if (!systemAddress) {
      throw errors.NOT_FOUND({
        message: `System not found: ${input.id}`,
      });
    }
    const systemContext = await getSystemContext(
      getEthereumAddress(systemAddress),
      context.theGraphClient
    );
    if (!systemContext) {
      throw errors.NOT_FOUND({
        message: `System not found: ${input.id}`,
      });
    }
    const output: SystemReadOutput = {
      id: systemContext.address,
      deployedInTransaction: systemContext.deployedInTransaction,
      identityRegistry: systemContext.identityRegistry ?? null,
      identityFactory: systemContext.identityFactory ?? null,
      trustedIssuersRegistry: systemContext.trustedIssuersRegistry ?? null,
      complianceModuleRegistry: systemContext.complianceModuleRegistry ?? null,
      tokenFactoryRegistry: systemContext.tokenFactoryRegistry ?? null,
      systemAddonRegistry: systemContext.systemAddonRegistry ?? null,
      tokenFactories: systemContext.tokenFactories,
      systemAddons: systemContext.systemAddons,
      complianceModules: systemContext.complianceModules,
      systemAccessManager: systemContext.systemAccessManager?.id ?? null,
      accessControl: systemContext.systemAccessManager?.accessControl ?? null,
    };
    return output;
  }
);
