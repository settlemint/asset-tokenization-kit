"use server";

import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

/**
 * GraphQL mutation for creating a new cryptocurrency
 *
 * @remarks
 * Creates a new cryptocurrency contract through the cryptocurrency factory
 */
const IsAddressDeployed = portalGraphql(`
  query IsAddressDeployed($address: String!, $predicted: String!) {
    FundFactory(address: $address) {
      isAddressDeployed(predicted: $predicted)
    }
  }
`);

export const isAddressDeployed = async (address: Address) => {
  const isDeployed = await portalClient.request(IsAddressDeployed, {
    address: FUND_FACTORY_ADDRESS,
    predicted: address,
  });

  return isDeployed.FundFactory?.isAddressDeployed;
};
