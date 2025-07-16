/**
 * Portal System Read Handler
 *
 * This handler retrieves system information directly from Portal GraphQL
 * when TheGraph hasn't indexed the system yet. It's specifically designed
 * to get the tokenFactoryRegistry address during the onboarding process.
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { z } from "zod";

/**
 * GraphQL query to fetch tokenFactoryRegistry from system contract
 * @param address - The system contract address to query
 * @returns tokenFactoryRegistryAddress
 */
const SYSTEM_TOKEN_FACTORY_REGISTRY_QUERY = portalGraphql(`
  query GetSystemTokenFactoryRegistry($address: String!) {
    IATKSystemTokenFactoryRegistry(address: $address) {
      tokenFactoryRegistryAddress
    }
  }
`);

/**
 * Reads system tokenFactoryRegistry directly from Portal.
 * @auth Required - User must be authenticated and onboarded
 * @middleware portalMiddleware - Provides Portal GraphQL client
 * @param input.id - The system contract address to query
 * @returns tokenFactoryRegistry address or null
 * @example
 * ```typescript
 * const result = await client.system.portalRead({
 *   id: "0x5e771e1417100000000000000000000000020088"
 * });
 *
 * if (result.tokenFactoryRegistry) {
 *   console.log(`TokenFactoryRegistry: ${result.tokenFactoryRegistry}`);
 * }
 * ```
 */
export const portalRead = onboardedRouter.system.portalRead
  .use(portalMiddleware)
  .handler(async ({ input, context }) => {
    try {
      const result = await context.portalClient.query(
        SYSTEM_TOKEN_FACTORY_REGISTRY_QUERY,
        { address: input.id },
        z.object({
          IATKSystemTokenFactoryRegistry: z
            .object({
              tokenFactoryRegistryAddress: z.string(),
            })
            .nullable(),
        }),
        "Failed to query system tokenFactoryRegistry"
      );

      return {
        tokenFactoryRegistry:
          result.IATKSystemTokenFactoryRegistry?.tokenFactoryRegistryAddress ??
          null,
      };
    } catch (error) {
      // If Portal query fails, return null instead of throwing
      // This allows the UI to handle the missing data gracefully
      return {
        tokenFactoryRegistry: null,
      };
    }
  });
