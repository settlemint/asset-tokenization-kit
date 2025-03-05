import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import {
  FundFragment,
  FundFragmentSchema,
  OffchainFundFragment,
  OffchainFundFragmentSchema,
} from "./fund-fragment";

/**
 * GraphQL query to fetch on-chain fund details from The Graph
 */
const FundDetail = theGraphGraphqlStarterkits(
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
  const normalizedAddress = getAddress(address);

  const [data, dbFund] = await Promise.all([
    theGraphClientStarterkits.request(FundDetail, { id: address }),
    hasuraClient.request(OffchainFundDetail, { id: normalizedAddress }),
  ]);

  const fund = safeParseWithLogging(FundFragmentSchema, data.fund, "fund");
  const offchainFund = dbFund.asset[0]
    ? safeParseWithLogging(
        OffchainFundFragmentSchema,
        dbFund.asset[0],
        "offchain fund"
      )
    : undefined;

  const topHoldersSum = fund.holders.reduce(
    (sum, holder) => sum + holder.valueExact,
    0n
  );
  const concentration =
    fund.totalSupplyExact === 0n
      ? 0
      : Number((topHoldersSum * 100n) / fund.totalSupplyExact);

  const assetsUnderManagement = fund.asAccount.balances.reduce(
    (acc, balance) => acc + balance.value,
    0
  );

  return {
    ...fund,
    ...{
      private: false,
      ...offchainFund,
    },
    concentration,
    assetsUnderManagement,
  };
});
