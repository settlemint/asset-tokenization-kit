import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import type { AvailableOutput } from "@/orpc/routes/system/token-factory/routes/factory.available.schema";
import { factoryPredictAddress } from "@/orpc/routes/system/token-factory/routes/factory.predict-address";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { call } from "@orpc/server";
import { z } from "zod";

/**
 * GraphQL query to check if an AccessControl entity exists at a given address.
 *
 * We use AccessControl instead of Token for availability checking because:
 * - AccessControl has a shorter salt (fewer variables) than Token
 * - AccessControl salt includes: symbol, name, decimals, initialAdmin
 * - Token salt includes: all AccessControl parameters + additional token configuration
 * - If AccessControl address is unique → Token address will definitely be unique
 * - The reverse is NOT guaranteed (token could be unique while AccessControl conflicts)
 *
 * This makes AccessControl the more reliable and conservative check for address availability.
 */
const CHECK_ACCESS_CONTROL_QUERY = theGraphGraphql(`
  query CheckAccessControl($address: ID!) {
    accessControl(id: $address) {
      id
    }
  }
`);

/**
 * Response schema for AccessControl query.
 */
const AccessControlResponseSchema = z.object({
  accessControl: z
    .object({
      id: z.string(),
    })
    .nullable(),
});

/**
 * ORPC handler for checking token address availability.
 *
 * This handler checks if a predicted address is available by querying for
 * an AccessControl entity at that address. AccessControl is used instead of
 * Token because it provides a more conservative uniqueness check due to its
 * shorter salt composition.
 *
 * @param input - Token creation parameters (same as predict address) or direct address
 * @param context - ORPC context with auth, system, and service clients
 * @returns Object with predicted address and availability boolean
 * @throws INTERNAL_SERVER_ERROR When prediction or query fails
 */
export const factoryAvailable = systemRouter.system.factory.available.handler(
  async ({ input, context }): Promise<AvailableOutput> => {
    let address: EthereumAddress;
    if ("address" in input) {
      address = input.address;
    } else {
      const { predictedAddress } = await call(
        factoryPredictAddress,
        input.parameters,
        {
          context,
        }
      );
      address = predictedAddress;
    }

    // Query TheGraph for AccessControl entity at the predicted address
    const response = await context.theGraphClient.query(
      CHECK_ACCESS_CONTROL_QUERY,
      {
        input: {
          address: address.toLowerCase(),
        },
        output: AccessControlResponseSchema,
      }
    );

    // Address is available if no AccessControl entity exists at that address
    return {
      isAvailable: response.accessControl === null,
    };
  }
);
