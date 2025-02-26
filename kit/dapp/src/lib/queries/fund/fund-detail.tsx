import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAddress, type Address } from 'viem';
import {
  FundFragment,
  FundFragmentSchema,
  OffchainFundFragment,
  OffchainFundFragmentSchema,
} from './fund-fragment';

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
export async function getFundDetail({ address }: FundDetailProps) {
  try {
    const normalizedAddress = getAddress(address);

    const [data, dbFund] = await Promise.all([
      theGraphClientStarterkits.request(FundDetail, { id: address }),
      hasuraClient.request(OffchainFundDetail, { id: normalizedAddress }),
    ]);

    const fund = safeParseWithLogging(FundFragmentSchema, data.fund, 'fund');
    const offchainFund = dbFund.asset[0]
      ? safeParseWithLogging(
          OffchainFundFragmentSchema,
          dbFund.asset[0],
          'offchain fund'
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

    return {
      ...fund,
      ...{
        private: false,
        ...offchainFund,
      },
      concentration,
    };
  } catch (error) {
    // Re-throw with more context
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch fund with address ${address}`);
  }
}

/**
 * Generates a consistent query key for fund detail queries
 *
 * @param params - Object containing the fund address
 * @returns Array representing the query key for React Query
 */
export const getQueryKey = ({ address }: FundDetailProps) =>
  ['asset', 'detail', 'fund', getAddress(address)] as const;

/**
 * React Query hook for fetching fund details
 *
 * @param params - Object containing the fund address
 * @returns Query result with fund data and query key
 */
export function useFundDetail({ address }: FundDetailProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getFundDetail({ address }),
  });

  return {
    ...result,
    queryKey,
    // Inline fund config values
    assetType: 'fund' as const,
    urlSegment: 'funds',
    theGraphTypename: 'Fund' as const,
  };
}
