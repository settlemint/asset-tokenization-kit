"use server";

import { EQUITY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the equity factory
 */
const IsAddressDeployed = portalGraphql(`
  query IsAddressDeployed($address: String!, $token: String!) {
    EquityFactory(address: $address) {
      isAddressDeployed(token: $token)
    }
  }
`);

const IsAddressDeployedSchema = z.object({
  EquityFactory: z.object({
    isAddressDeployed: z.boolean(),
  }),
});

export const isAddressDeployed = cache(async (address: Address) => {
  const data = await portalClient.request(IsAddressDeployed, {
    address: EQUITY_FACTORY_ADDRESS,
    token: address,
  });

  const isAddressDeployed = safeParseWithLogging(
    IsAddressDeployedSchema,
    data,
    "equity factory"
  );

  return isAddressDeployed.EquityFactory.isAddressDeployed;
});
