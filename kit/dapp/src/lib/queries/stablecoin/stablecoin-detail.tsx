import { assetConfig } from '@/lib/config/assets';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { addSeconds } from 'date-fns';
import BigDecimal from 'js-big-decimal';
import { getAddress, type Address } from 'viem';
import {
  OffchainStableCoinFragment,
  OffchainStableCoinFragmentSchema,
  StableCoinFragment,
  StableCoinFragmentSchema,
} from './stablecoin-fragment';

/**
 * GraphQL query to fetch on-chain stablecoin details from The Graph
 */
const StableCoinDetail = theGraphGraphqlStarterkits(
  `
  query StableCoinDetail($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin details from Hasura
 */
const OffchainStableCoinDetail = hasuraGraphql(
  `
  query OffchainStableCoinDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainStableCoinFragment
    }
  }
`,
  [OffchainStableCoinFragment]
);

/**
 * Props interface for stablecoin detail components
 */
export interface StableCoinDetailProps {
  /** Ethereum address of the stablecoin contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain stablecoin data
 *
 * @param params - Object containing the stablecoin address
 * @returns Combined stablecoin data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export async function getStableCoinDetail({ address }: StableCoinDetailProps) {
  try {
    const normalizedAddress = getAddress(address);

    const [data, dbStableCoin] = await Promise.all([
      theGraphClientStarterkits.request(StableCoinDetail, { id: address }),
      hasuraClient.request(OffchainStableCoinDetail, { id: normalizedAddress }),
    ]);

    const stableCoin = safeParseWithLogging(
      StableCoinFragmentSchema,
      data.stableCoin,
      'stablecoin'
    );
    const offchainStableCoin = dbStableCoin.asset[0]
      ? safeParseWithLogging(
          OffchainStableCoinFragmentSchema,
          dbStableCoin.asset[0],
          'offchain stablecoin'
        )
      : undefined;

    const topHoldersSum = stableCoin.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );
    const concentration =
      stableCoin.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / stableCoin.totalSupplyExact);

    const collateralCommittedRatio =
      stableCoin.collateral.compareTo(new BigDecimal(0)) === 0
        ? new BigDecimal(100)
        : stableCoin.totalSupply
            .divide(stableCoin.collateral)
            .multiply(new BigDecimal(100));

    const collateralProofValidity = addSeconds(
      stableCoin.lastCollateralUpdate,
      stableCoin.liveness
    );

    return {
      ...stableCoin,
      ...{
        private: false,
        ...offchainStableCoin,
      },
      concentration,
      collateralCommittedRatio,
      collateralProofValidity,
    };
  } catch (error) {
    // Re-throw with more context
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch stablecoin with address ${address}`);
  }
}

/**
 * Generates a consistent query key for stablecoin detail queries
 *
 * @param params - Object containing the stablecoin address
 * @returns Array representing the query key for React Query
 */
const getQueryKey = ({ address }: StableCoinDetailProps) =>
  [
    'asset',
    'detail',
    assetConfig.stablecoin.queryKey,
    getAddress(address),
  ] as const;

/**
 * React Query hook for fetching stablecoin details
 *
 * @param params - Object containing the stablecoin address
 * @returns Query result with stablecoin data, config, and query key
 */
export function useStableCoinDetail({ address }: StableCoinDetailProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getStableCoinDetail({ address }),
  });

  return {
    ...result,
    config: assetConfig.stablecoin,
    queryKey,
  };
}
