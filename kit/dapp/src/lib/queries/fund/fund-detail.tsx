import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox/index";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { fundCalculateFields } from "./fund-calculated";
import { FundFragment, OffchainFundFragment } from "./fund-fragment";
import { OffChainFundSchema, OnChainFundSchema } from "./fund-schema";

/**
 * GraphQL query to fetch on-chain fund details from The Graph
 */
const FundDetail = theGraphGraphqlKit(
  `
  query FundDetail($id: ID!) {
    fund(id: $id) {
      ...FundFragment
    }
  }
`,
  [FundFragment]
);

/**
 * GraphQL query to fetch off-chain fund details from Hasura
 */
const OffchainFundDetail = hasuraGraphql(
  `
  query OffchainFundDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainFundFragment
    }
  }
`,
  [OffchainFundFragment]
);

/**
 * Props interface for fund detail components
 */
export interface FundDetailProps {
  /** Ethereum address of the fund contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain fund data
 *
 * @param params - Object containing the fund address
 * @returns Combined fund data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getFundDetail = cache(async ({ address }: FundDetailProps) => {
  const [onChainFund, offChainFund] = await Promise.all([
    (async () => {
      const response = await theGraphClientKit.request(FundDetail, {
        id: address,
      });
      if (!response.fund) {
        throw new Error("Fund not found");
      }
      return safeParse(OnChainFundSchema, response.fund);
    })(),
    (async () => {
      const response = await hasuraClient.request(OffchainFundDetail, {
        id: getAddress(address),
      });
      if (response.asset.length === 0) {
        return undefined;
      }
      return safeParse(OffChainFundSchema, response.asset[0]);
    })(),
  ]);

  const calculatedFields = fundCalculateFields(onChainFund, offChainFund);

  return {
    ...onChainFund,
    ...offChainFund,
    ...calculatedFields,
  };
});
