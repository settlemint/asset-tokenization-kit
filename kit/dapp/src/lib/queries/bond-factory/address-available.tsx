"use server";

import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL mutation for creating a new cryptocurrency
 *
 * @remarks
 * Creates a new cryptocurrency contract through the cryptocurrency factory
 */
const IsAddressDeployed = portalGraphql(`
  query IsAddressDeployed($address: String!, $token: String!) {
    BondFactory(address: $address) {
      isAddressDeployed(token: $token)
    }
  }
`);

const IsAddressDeployedSchema = z.object({
  BondFactory: z.object({
    isAddressDeployed: z.boolean(),
  }),
});

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await portalClient.request(IsAddressDeployed, {
    address: BOND_FACTORY_ADDRESS,
    token: address,
  });

  const isAddressDeployed = safeParseWithLogging(
    IsAddressDeployedSchema,
    data,
    "bond factory"
  );
  console.log({ isAddressDeployed });
  return !isAddressDeployed.BondFactory.isAddressDeployed;
});
