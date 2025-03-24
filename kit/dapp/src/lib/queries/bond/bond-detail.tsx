import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox/index";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { bondCalculateFields } from "./bond-calculated";
import { BondFragment, OffchainBondFragment } from "./bond-fragment";
import { OffChainBondSchema, OnChainBondSchema } from "./bond-schema";

/**
 * GraphQL query to fetch on-chain bond details from The Graph
 */
const BondDetail = theGraphGraphqlKit(
  `
  query BondDetail($id: ID!) {
    bond(id: $id) {
      ...BondFragment
    }
  }
`,
  [BondFragment]
);

/**
 * GraphQL query to fetch off-chain bond details from Hasura
 */
const OffchainBondDetail = hasuraGraphql(
  `
  query OffchainBondDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainBondFragment
    }
  }
`,
  [OffchainBondFragment]
);

/**
 * Props interface for bond detail components
 */
export interface BondDetailProps {
  /** Ethereum address of the bond contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain bond data
 *
 * @param params - Object containing the bond address
 * @returns Combined bond data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getBondDetail = cache(async ({ address }: BondDetailProps) => {
  const [onChainBond, offChainBond] = await Promise.all([
    (async () => {
      const response = await theGraphClientKit.request(BondDetail, {
        id: address,
      });
      if (!response.bond) {
        throw new Error("Bond not found");
      }
      return safeParse(OnChainBondSchema, response.bond);
    })(),
    (async () => {
      const response = await hasuraClient.request(OffchainBondDetail, {
        id: getAddress(address),
      });
      if (response.asset.length === 0) {
        return undefined;
      }
      return safeParse(OffChainBondSchema, response.asset[0]);
    })(),
  ]);

  const calculatedFields = bondCalculateFields(onChainBond, offChainBond);

  return {
    ...onChainBond,
    ...offChainBond,
    ...calculatedFields,
  };
});
