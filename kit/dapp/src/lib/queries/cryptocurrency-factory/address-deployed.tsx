"use server";

import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the cryptocurrency factory
 */
const IsAddressDeployed = portalGraphql(`
  query IsAddressDeployed($address: String!, $token: String!) {
    CryptoCurrencyFactory(address: $address) {
      isAddressDeployed(token: $token)
    }
  }
`);

const IsAddressDeployedSchema = z.object({
  CryptoCurrencyFactory: z.object({
    isAddressDeployed: z.boolean(),
  }),
});

export const isAddressDeployed = cache(async (address: Address) => {
  const data = await portalClient.request(IsAddressDeployed, {
    address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    token: address,
  });

  const isAddressDeployed = safeParseWithLogging(
    IsAddressDeployedSchema,
    data,
    "cryptocurrency factory"
  );

  return isAddressDeployed.CryptoCurrencyFactory.isAddressDeployed;
});
